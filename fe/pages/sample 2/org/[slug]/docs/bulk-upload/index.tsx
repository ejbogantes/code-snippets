/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
// auth0 authentication & react and next & encrypt
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import Link from 'next/link';
import SwipeableViews from 'react-swipeable-views';
import { get as _get } from 'lodash';

// material ui stuff
import { Box, Grid, Stack, Divider, Typography, Stepper, Step, StepLabel } from '@mui/material';
import LibraryAdd from '@mui/icons-material/LibraryAdd';

// steps and components
import UploadSpreadsheet from './steps/UploadSpreadsheet';
import UploadPDFs from './steps/UploadPDFs';
import Validation from './steps/Validation';
import Submit from './steps/Submit';
import PageWrapper from '../../../../../wrappers/pageWrapper';

// soom-ui
import { SoomButton, SoomCard, SoomDialog, SoomTypography, SoomAlert } from '@soom-universe/soom-ui';

// soom constants
import { defaultDatabase } from '@soom-universe/soom-utils/constants';

// soom utils
import { getNewDocumentId } from '@soom-universe/soom-utils/functions';

// uploader
import { Uploader } from '../../../../../helpers/uploader';

// helpers
import {
  requestGetProfileByEmailOrg,
  requestCreateDocument,
  requestGetDatabases
} from '../../../../../helpers/request';
import { validateProfile } from '../../../../../helpers/validations';
import { hasAccess } from '../../../../../helpers/PermissionValidator';

// formik and yup
import { Formik, Form } from 'formik';

// styles
import styles from './index.module.scss';

const steps = [UploadPDFs, UploadSpreadsheet, Validation, Submit];

// get public runtime settings
const {
  publicRuntimeConfig: { appName }
} = getConfig();

export default withPageAuthRequired(function BulkUpload({ user }) {
  const router = useRouter();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [completeConfig, setCompleteConfig] = useState(false);
  const [profile, setProfile] = useState({ organizationProfiles: [] });
  const [pageAccess, setPageAccess] = useState(false);
  const [profileData, setProfileData] = useState({ regions: {}, languages: {} });
  const [data, setData] = useState({ files: undefined, spreadsheet: undefined, rows: undefined });
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [org, setOrg] = useState<string>(undefined);
  const [bucket, setBucket] = useState<string>('');
  const [configId, setConfigId] = useState();
  const [submit, setSubmit] = useState<boolean>(false);
  const [loadingDatabases, setLoadingDatabases] = useState(true);
  const [databasesState, setDatabasesState] = useState({ options: [], selected: defaultDatabase.value });

  // multi dashboard
  const [BUState, setBUState] = useState({ show: false, options: [], selected: '-1' });

  useEffect(() => {
    if (!router.isReady) return;
    const orgName = router.query.slug as string;
    setOrg(orgName);
  }, [router.isReady]);

  useEffect(() => {
    if (!org) return;
    // get profile data
    const fetchProfileData = async () => {
      // get data from db
      const profile = await requestGetProfileByEmailOrg(appName, org);
      const pageAccess = hasAccess('bulkUpload', profile);
      const regions = _get(profile, 'organizationProfiles.0.configuration.regions', []);
      const languages = _get(profile, 'organizationProfiles.0.configuration.languages', []);
      const bucket = _get(profile, 'organizationProfiles.0.configuration.bucket', '');
      const configId = _get(profile, 'organizationProfiles.0.configuration.configuration_id', '');
      const completeConfig = validateProfile(profile, 'configuration');
      const businessUnit = _get(profile, 'organizationProfiles[0].businessUnit', null);
      const businessUnits = _get(profile, 'orgBusinessUnits', []);
      if (!businessUnit && businessUnits.length > 0) {
        const buList = profile.orgBusinessUnits.map((item) => {
          return { value: item.slug, label: item.name };
        });
        buList.unshift({ value: '-1', label: 'All Business Units' });
        setBUState({ ...BUState, show: true, options: buList });
      }

      setCompleteConfig(completeConfig);
      setProfileData({ regions, languages });
      setBucket(bucket);
      setConfigId(configId);
      setProfile(profile);
      setPageAccess(pageAccess);
      setLoadingProfile(false);
    };

    fetchProfileData().catch(console.error);
  }, [org]);

  useEffect(() => {
    if (!profile || !pageAccess) return;

    const fetchDatabaseData = async () => {
      // get data from db
      setLoadingDatabases(true);
      let databasesList = await requestGetDatabases(appName, org);
      if (databasesList) {
        databasesList = databasesList.map((db) => ({ label: db, value: db }));
      } else {
        databasesList = [];
      }
      setDatabasesState({ ...databasesState, options: [defaultDatabase, ...databasesList] });
      setLoadingDatabases(false);
    };

    fetchDatabaseData();
  }, [profile, pageAccess]);

  const isLastStep = () => {
    return activeStep === steps.length - 1;
  };

  const handlePrev = () => {
    setActiveStep(Math.max(activeStep - 1, 0));
  };

  const handleNext = () => [setActiveStep(Math.min(activeStep + 1, steps.length - 1))];

  const handleCancel = () => {
    router.push(`/org/${org}`);
  };

  // uploads file
  const uploadFile = async (hash: string, element: any) => {
    if (element.file && profile) {
      const fileUploaderOptions = {
        bucket,
        fileName: `unpublished/${hash}`,
        file: element.file
      };

      let percentage;

      const uploader = new Uploader(fileUploaderOptions);
      element.uploadStatus = 'uploading';

      uploader
        .onProgress(({ percentage: newPercentage }) => {
          // to avoid the same percentage to be logged twice
          if (newPercentage !== percentage) {
            percentage = newPercentage;
          }
        })
        .onError((error) => {
          console.error(error);
          element.uploadStatus = 'error';
        });

      uploader.start();
    }
  };

  const onSubmit = async (values, formikBag) => {
    const { setSubmitting } = formikBag;

    // manage next behavior
    if (!isLastStep()) {
      setSubmitting(false);
      handleNext();
      return;
    }

    // manage last submit
    setSubmitting(true);
    setSubmit(true);

    // set all rows in queue
    const newRows = data.rows;

    // loop each file
    let count = 0;
    for (const element of newRows) {
      count++;
      element.uploadStatus = 'queue';
      setData({ ...data, rows: newRows });
      const { organizationProfiles } = profile;

      // submit process
      try {
        // get organization settings
        if (organizationProfiles.length > 0 && bucket !== '') {
          // let's upload the file
          const documentId = getNewDocumentId(configId, `-${count}`);

          const uploadFileResult = await new Promise((resolve) => {
            uploadFile(documentId, element)
              .then(async () => {
                resolve(true);
              })
              .catch((error) => {
                console.error(error);
                resolve(false);
              });
          });

          if (!uploadFileResult) {
            element.uploadStatus = 'error';
            setData({ ...data, rows: newRows });
          } else {
            element.uploadStatus = 'processing';
            setData({ ...data, rows: newRows });

            // lets prepare object to send
            const newDocument = {
              app: appName,
              org,
              audience: element.audience,
              first_applicable_lot_number: '',
              document_number: element.documentNumber,
              expiry_date: '',
              language:
                element.language !== '' && element.language !== null
                  ? element.language.split(',').map((e) => e.trim())
                  : [],
              brand_name: element.brandName,
              cfn: element.cfn !== '' && element.cfn !== null ? element.cfn.split(',').map((e) => e.trim()) : [],
              type: element.documentType || 'eIFU',
              business_unit: BUState.selected !== '-1' ? BUState.selected : undefined,
              revision: element.revision,
              document_name: element.file ? element.file.name : '',
              safety_update: element.safetyUpdate,
              date_of_issue: new Date().toISOString(),
              last_applicable_lot_number: '',
              region:
                element.regionCountry !== '' && element.regionCountry !== null
                  ? element.regionCountry.split(',').map((e) => e.trim())
                  : [],
              alternate_brand_name:
                element.alternateBrandName !== '' && element.alternateBrandName !== null
                  ? element.alternateBrandName.split(',').map((e) => e.trim())
                  : [],
              key: element.file ? documentId : '',
              email: user.email,
              database: databasesState.selected,
              definition: undefined,
              description: undefined,
              gtins: undefined
            };

            if (databasesState.selected === defaultDatabase.value) {
              newDocument.definition = element.definition && element.definition !== '' ? [element.definition] : [];
              newDocument.description = element.description && element.description !== '' ? [element.description] : [];
              newDocument.gtins =
                element.gtins !== '' && element.gtins !== null ? element.gtins.split(',').map((e) => e.trim()) : [];
            }

            await requestCreateDocument(newDocument);
            element.uploadStatus = 'completed';
            setData({ ...data, rows: newRows });
          }
        } else {
          element.uploadStatus = 'error';
          setData({ ...data, rows: newRows });
          setSubmitting(false);
          setSubmit(false);
        }
      } catch (error) {
        console.error(error);
        element.uploadStatus = 'error';
        setData({ ...data, rows: newRows });
      }
    }
    setSubmitting(false);
    setSubmit(false);
    setShowDialog(true);
  };

  const initialValues = steps.reduce(
    (values, { initialValues }) => ({
      ...values,
      ...initialValues
    }),
    {}
  );

  const ActiveStep = steps[activeStep];
  const validationSchema = ActiveStep.validationSchema;

  // handle steps functions

  // files
  function handleFilesChange(value) {
    setData({ ...data, files: value });
  }

  // data
  function handleSpreadsheetChange(value) {
    setData({ ...data, spreadsheet: value });
  }

  // validate
  function handleValidationChange(value) {
    setData({ ...data, rows: value });
  }

  return (
    <PageWrapper
      org={org}
      profile={profile}
      loading={loadingProfile || (pageAccess && loadingDatabases)}
      pageAccess={pageAccess}
    >
      {!completeConfig ? (
        <Box sx={{ flexGrow: 1 }} className={styles.form__container}>
          <SoomCard dataTestId="prueba" ariaLabel="prueba">
            <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
              <Typography variant="h6" component="div">
                <LibraryAdd sx={{ verticalAlign: 'middle' }} /> Multiple documents
              </Typography>
            </Stack>
            <Divider className={styles.divider__header} />
            <Grid container spacing={2} pt={2} style={{ minHeight: '500px' }}>
              <Grid item xs={12}>
                <SoomAlert
                  dataTestId="WarningAlertDiv"
                  ariaLabel="WarningAlertDiv"
                  severity="warning"
                  sx={{ mb: 2, mx: 2 }}
                >
                  <SoomTypography
                    dataTestId="warningMessage"
                    ariaLabel="warningMessage"
                    text={
                      <>
                        To upload documents it is required to complete the settings. Go to{' '}
                        <Link legacyBehavior href={`/org/${org}/settings`}>
                          <a
                            rel="noopener"
                            className={styles['soom-eifu-link']}
                            style={{ textDecoration: 'underline' }}
                          >
                            <strong>Settings page</strong>
                          </a>
                        </Link>{' '}
                        and fill it out.
                      </>
                    }
                    variant="body1"
                    component="span"
                  />
                </SoomAlert>
              </Grid>
            </Grid>
          </SoomCard>
        </Box>
      ) : (
        <Box className={styles.form__container_full}>
          <SoomCard dataTestId="form" ariaLabel="card">
            <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
              <Typography variant="h6" component="div">
                <LibraryAdd sx={{ verticalAlign: 'middle' }} /> Multiple documents
              </Typography>
            </Stack>
            <Divider className={styles.divider__header} />
            <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
              {({ isSubmitting }) => (
                <>
                  <Form className={styles.form}>
                    <Stepper alternativeLabel nonLinear activeStep={activeStep} className={styles.stepper}>
                      {steps.map((step, index) => (
                        <Step key={index}>
                          <StepLabel>{steps[index].label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    <SwipeableViews index={activeStep}>
                      <UploadPDFs
                        onChange={(e) => {
                          handleFilesChange(e);
                        }}
                        BUState={BUState}
                        setBUState={setBUState}
                        databasesState={databasesState}
                        setDatabasesState={setDatabasesState}
                      />
                      <UploadSpreadsheet
                        onChange={(e) => {
                          handleSpreadsheetChange(e);
                        }}
                      />
                      <Validation
                        files={data.files}
                        spreadsheet={data.spreadsheet}
                        onChange={(e) => {
                          handleValidationChange(e);
                        }}
                        regions={profileData.regions}
                        languages={profileData.languages}
                      />
                      <Submit rows={data.rows} />
                    </SwipeableViews>
                    <div className={styles.buttons__container}>
                      <SoomButton
                        dataTestId="btnCancel"
                        ariaLabel="Cancel"
                        variant="outlined"
                        handlerOnClick={handleCancel}
                        label="Cancel"
                        disabled={isSubmitting}
                      />
                      <SoomButton
                        dataTestId="btnPrev"
                        ariaLabel="prev"
                        label="Previous"
                        variant="contained"
                        handlerOnClick={handlePrev}
                        disabled={activeStep === 0 || submit}
                      />
                      <SoomButton
                        dataTestId="btnNext"
                        ariaLabel="Next"
                        label={isLastStep() ? 'Submit' : 'Next'}
                        variant="contained"
                        disabled={
                          (activeStep === 0 && data.files === undefined) ||
                          (activeStep === 1 && data.spreadsheet === undefined) ||
                          (activeStep === 2 && data.rows && data.rows.filter((o) => o.status === false).length > 0) ||
                          (activeStep === 3 && showDialog)
                        }
                        loading={submit}
                        type="submit"
                      />
                    </div>
                  </Form>
                </>
              )}
            </Formik>
          </SoomCard>
          {showDialog && (
            <div>
              <SoomDialog
                dataTestId="Message"
                ariaLabel="Message"
                title="Soom eIFU Dashboard | Confirmation"
                open={true}
                firstButton="Accept"
                handleOpenFirst={handleCancel}
              >
                <SoomTypography
                  dataTestId="messageInfo"
                  ariaLabel="Message Confirmation"
                  text={`All ${data.rows.length} documents were successfully uploaded.`}
                  variant="body1"
                  component="span"
                  align="left"
                />
              </SoomDialog>
            </div>
          )}
        </Box>
      )}
    </PageWrapper>
  );
});
