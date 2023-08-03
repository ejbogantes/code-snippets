/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
// auth0 authentication & react and next & encrypt
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import Link from 'next/link';
import { get as _get } from 'lodash';

// material ui stuff
import {
  Box,
  Grid,
  Typography,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { NoteAdd } from '@mui/icons-material';
import { MuiChipsInput } from 'mui-chips-input';
import { DropzoneArea } from 'mui-file-dropzone';

// formik and yup
import { useFormik } from 'formik';
import * as yup from 'yup';

// soom-ui and other components
import {
  SoomAlert,
  SoomButton,
  SoomCard,
  SoomSelect,
  SoomTextField,
  SoomTypography,
  SoomSwitch
} from '@soom-universe/soom-ui';

import PageWrapper from '../../../../../wrappers/pageWrapper';

// uploader
import { Uploader } from '../../../../../helpers/uploader';

// requests
import {
  requestGetProfileByEmailOrg,
  requestCreateDocument,
  requestGetDatabases
} from '../../../../../helpers/request';
import { validateProfile } from '../../../../../helpers/validations';
import { hasAccess } from '../../../../../helpers/PermissionValidator';

// styles
import styles from './index.module.scss';

// get soom constants
import {
  documentStatuses,
  documentTypes,
  defaultDocumentTypes,
  audienceDefault,
  audienceOptions,
  defaultDatabase
} from '@soom-universe/soom-utils/constants';

// get soom utils
import { getNewDocumentId } from '@soom-universe/soom-utils/functions';

// get public runtime settings
const {
  publicRuntimeConfig: { appName, maxFileSizeUpload }
} = getConfig();

// form validations
const validationSchema = yup.object({
  txtDocumentNumber: yup.string().required('The Document number is required'),
  txtRevision: yup.string().required('The revision is required'),
  txtBrandName: yup.string().required('The Brand name is required')
});

// default dropzone text
const defaultDropzoneText = 'Drag & drop a file here or click';

export default withPageAuthRequired(function New({ user }) {
  const router = useRouter();

  const [org, setOrg] = useState<string>();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [completeConfig, setCompleteConfig] = useState(false);
  const [profile, setProfile] = useState(undefined);
  const [pageAccess, setPageAccess] = useState(false);
  const [bucket, setBucket] = useState<string>();
  const [configId, setConfigId] = useState();
  const [doctorAudience, setDoctorAudience] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [data, setData] = useState({
    countries: [],
    languages: [],
    docsTypes: [],
    statuses: documentStatuses
  });
  const [file, setFile] = useState(undefined);
  const [uploader, setUploader] = useState(undefined);
  const [dropzoneText, setDropzoneText] = useState(defaultDropzoneText);
  const [loadingDatabases, setLoadingDatabases] = useState(true);
  const [databases, setDatabases] = useState([]);

  // dialog
  const [confirmState, setConfirmState] = useState({ open: false });

  // multi dashboard
  const [BUState, setBUState] = useState({ show: false, options: [] });

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
      const pageAccess = hasAccess('newDoc', profile);
      const countries = _get(profile, 'organizationProfiles.0.configuration.regions', []);
      const languages = _get(profile, 'organizationProfiles.0.configuration.languages', []);
      const bucket = _get(profile, 'organizationProfiles.0.configuration.bucket', '');
      const configId = _get(profile, 'organizationProfiles.0.configuration.configuration_id', '');
      const doctorAudience = _get(profile, 'organizationProfiles.0.configuration.doctor_audience', false);
      const completeConfig = validateProfile(profile, 'configuration');
      const boundaries = _get(profile, 'organizationProfiles.0.license.licenseBoundaries', {});
      const docsTypes =
        !boundaries['documents-types'] || !boundaries['documents-types'].enabled ? defaultDocumentTypes : documentTypes;
      const businessUnit = _get(profile, 'organizationProfiles[0].businessUnit', null);
      const businessUnits = _get(profile, 'orgBusinessUnits', []);
      if (!businessUnit && businessUnits.length > 0) {
        const buList = profile.orgBusinessUnits.map((item) => {
          return { value: item.slug, label: item.name };
        });
        buList.unshift({ value: '-1', label: 'All Business Units' });
        setBUState({ show: true, options: buList });
      }

      setCompleteConfig(completeConfig);
      setData({ ...data, countries, languages, docsTypes });
      setBucket(bucket);
      setConfigId(configId);
      setDoctorAudience(doctorAudience);
      setProfile(profile);
      setPageAccess(pageAccess);
      setLoadingProfile(false);
    };

    fetchProfileData();
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
      setDatabases([defaultDatabase, ...databasesList]);
      setLoadingDatabases(false);
    };

    fetchDatabaseData();
  }, [profile, pageAccess]);

  // this is to handle the form cancel button
  const handleCancel = () => {
    router.push(`/org/${org}`);
  };

  // upload file
  const uploadFile = async (hash: string) => {
    if (file && profile) {
      setDropzoneText(`Uploading 0%`);
      const fileUploaderOptions = {
        bucket,
        fileName: `unpublished/${hash}`,
        file,
        isPrivate: true
      };

      let percentage;

      const uploader = new Uploader(fileUploaderOptions);
      setUploader(uploader);

      uploader
        .onProgress(({ percentage: newPercentage }) => {
          // to avoid the same percentage to be logged twice
          if (newPercentage !== percentage) {
            percentage = newPercentage;
            setDropzoneText(`Uploading ${percentage}%`);
          }
          if (percentage === 100) {
            setDropzoneText(`File successfully uploaded!`);
          }
        })
        .onError((error) => {
          setDropzoneText(defaultDropzoneText);
          setFile(undefined);
          console.error(error);
        });

      uploader.start();
    }
  };

  // on file upload cancel
  const onFileUploadCancel = () => {
    if (uploader) {
      uploader.abort();
      setFile(undefined);
      setDropzoneText(defaultDropzoneText);
    }
  };

  // this is to handle the file upload
  const handleFileUpload = (files) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleOpenConfirm = () => {
    setConfirmState({ open: true });
  };

  const handleCloseConfirm = () => {
    setConfirmState({ open: false });
  };

  const formik = useFormik({
    initialValues: {
      cboLanguages: '',
      cboStatus: 'draft',
      cboCountries: '',
      cboDocsTypes: 'eIFU',
      txtDocumentNumber: '',
      txtRevision: '',
      txtBrandName: '',
      txtAlternateBrandName: [],
      txtDefinition: '',
      txtDescription: '',
      txtCFN: [],
      txtGTIN: [],
      swSafetyUpdate: false,
      audience: audienceDefault,
      businessUnit: '-1',
      database: defaultDatabase.value
    },
    validationSchema,
    onSubmit: async (values) => {
      setShowAlert(false);
      setShowErrorAlert(false);

      try {
        const { organizationProfiles } = profile;
        // get organization settings
        if (organizationProfiles.length > 0 && bucket !== '') {
          // let's upload the file
          const documentId = getNewDocumentId(configId);

          const uploadFileResult = await new Promise((resolve) => {
            uploadFile(documentId)
              .then(async () => {
                resolve(true);
              })
              .catch((error) => {
                console.error(error);
                resolve(false);
              });
          });

          if (!uploadFileResult) {
            setShowErrorAlert(true);
            return;
          }

          // lets prepare object to send
          const newDocument = {
            app: appName,
            org,
            audience: values.audience,
            first_applicable_lot_number: '',
            document_number: values.txtDocumentNumber,
            expiry_date: '',
            language: values.cboLanguages !== '' ? values.cboLanguages : [],
            brand_name: values.txtBrandName,
            cfn: values.txtCFN,
            type: values.cboDocsTypes,
            business_unit: values.businessUnit !== '-1' ? values.businessUnit : undefined,
            revision: values.txtRevision,
            document_name: file ? file.name : '',
            safety_update: values.swSafetyUpdate,
            date_of_issue: new Date().toISOString(),
            last_applicable_lot_number: '',
            region: values.cboCountries !== '' ? values.cboCountries : [],
            alternate_brand_name: values.txtAlternateBrandName,
            key: file ? documentId : '',
            email: user.email,
            database: values.database,
            definition: undefined,
            description: undefined,
            gtins: undefined
          };

          if (formik.values.database === defaultDatabase.value) {
            newDocument.definition = values.txtDefinition && values.txtDefinition !== '' ? [values.txtDefinition] : [];
            newDocument.description =
              values.txtDescription && values.txtDescription !== '' ? [values.txtDescription] : [];
            newDocument.gtins = values.txtGTIN;
          }

          const result = await requestCreateDocument(newDocument);
          if (!result) {
            setShowErrorAlert(true);
            return;
          }

          setTimeout(() => {
            router.push(`/org/${org}/docs/edit/${documentId}`);
          }, 100);
        } else {
          setShowErrorAlert(true);
        }
      } catch (error) {
        console.error(error);
        setShowErrorAlert(true);
      }
    }
  });

  return (
    <PageWrapper
      org={org}
      profile={profile}
      loading={loadingProfile || (pageAccess && loadingDatabases)}
      pageAccess={pageAccess}
    >
      {!completeConfig ? (
        <Box sx={{ flexGrow: 1 }} className={styles.form__container}>
          <SoomCard dataTestId="cardNewDocument" ariaLabel="prueba">
            <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
              <Typography variant="h6" component="div">
                <NoteAdd sx={{ verticalAlign: 'middle' }} /> New document
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
                        To create new documents it is required to complete the settings. Go to{' '}
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
        <>
          <Box sx={{ flexGrow: 1 }} className={styles.form__container}>
            <SoomCard dataTestId="prueba" ariaLabel="prueba">
              <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
                <Typography variant="h6" component="div">
                  <NoteAdd sx={{ verticalAlign: 'middle' }} /> New document
                </Typography>
              </Stack>
              <Divider className={styles.divider__header} />
              <form className={styles.form} onSubmit={formik.handleSubmit}>
                <Grid container spacing={2} pt={2}>
                  <Grid item xs={4}>
                    <SoomTextField
                      dataTestId="txtDocumentNumber"
                      ariaLabel="Document number"
                      id="txtDocumentNumber"
                      name="txtDocumentNumber"
                      variant="outlined"
                      label="Document number"
                      placeholder="Enter document number"
                      required={true}
                      value={formik.values.txtDocumentNumber}
                      handlerOnChange={formik.handleChange}
                      error={formik.touched.txtDocumentNumber && Boolean(formik.errors.txtDocumentNumber)}
                      helperText={formik.touched.txtDocumentNumber && formik.errors.txtDocumentNumber}
                      className={styles[`soom-dashboard-inputsize`]}
                      disabled={formik.isSubmitting}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <SoomTextField
                      dataTestId="txtRevision"
                      ariaLabel="Revision"
                      id="txtRevision"
                      name="txtRevision"
                      variant="outlined"
                      label="Revision"
                      placeholder="Enter revision"
                      required={true}
                      value={formik.values.txtRevision}
                      handlerOnChange={formik.handleChange}
                      error={formik.touched.txtRevision && Boolean(formik.errors.txtRevision)}
                      helperText={formik.touched.txtRevision && formik.errors.txtRevision}
                      className={styles[`soom-dashboard-inputsize`]}
                      disabled={formik.isSubmitting}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <SoomSelect
                      dataTestId="cboDocsTypes"
                      ariaLabel="Document Type"
                      options={data.docsTypes}
                      isMultiple={false}
                      id="cboDocsTypes"
                      name="cboDocsTypes"
                      label="Document type"
                      labelId="cboDocsTypesLabel"
                      value={formik.values.cboDocsTypes}
                      onChange={formik.handleChange}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2} pt={2}>
                  <Grid item xs={4}>
                    <SoomTextField
                      dataTestId="txtBrandName"
                      ariaLabel="Brand Name"
                      id="txtBrandName"
                      name="txtBrandName"
                      variant="outlined"
                      label="Brand name"
                      placeholder="Enter the brand name"
                      required={true}
                      value={formik.values.txtBrandName}
                      handlerOnChange={formik.handleChange}
                      error={formik.touched.txtBrandName && Boolean(formik.errors.txtBrandName)}
                      helperText={formik.touched.txtBrandName && formik.errors.txtBrandName}
                      className={styles[`soom-dashboard-inputsize`]}
                      disabled={formik.isSubmitting}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <MuiChipsInput
                      fullWidth
                      id="txtAlternateBrandName"
                      name="txtAlternateBrandName"
                      label="Alternate brand names"
                      placeholder={`Type and press enter. e.g. ACME Corp "enter" Umbrella Corp "enter"`}
                      value={formik.values.txtAlternateBrandName}
                      onChange={(chips) => {
                        formik.setFieldValue('txtAlternateBrandName', chips);
                      }}
                      onKeyDown={(e) => {
                        // block ',' for conflicts with the functionality
                        if (e.key === ',') {
                          e.preventDefault();
                          return false;
                        }
                      }}
                      error={formik.touched.txtAlternateBrandName && Boolean(formik.errors.txtAlternateBrandName)}
                      helperText={
                        formik.touched.txtAlternateBrandName && formik.errors.txtAlternateBrandName
                          ? String(formik.errors.txtAlternateBrandName)
                          : undefined
                      }
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2} pt={2}>
                  <Grid item xs={12}>
                    <MuiChipsInput
                      fullWidth
                      id="txtCFN"
                      name="txtCFN"
                      label="CFNs or product codes"
                      placeholder={`Type and press enter. e.g. ABC123 "enter" XYZ664 "enter"`}
                      value={formik.values.txtCFN}
                      onChange={(chips) => {
                        formik.setFieldValue('txtCFN', chips);
                      }}
                      onKeyDown={(e) => {
                        // block ',' for conflicts with the functionality
                        if (e.key === ',') {
                          e.preventDefault();
                          return false;
                        }
                      }}
                      error={formik.touched.txtCFN && Boolean(formik.errors.txtCFN)}
                      helperText={
                        formik.touched.txtCFN && formik.errors.txtCFN ? String(formik.errors.txtCFN) : undefined
                      }
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2} pt={2}>
                  {data.countries.length > 0 && (
                    <Grid item xs={6}>
                      <SoomSelect
                        dataTestId="cboCountries"
                        ariaLabel="Countries"
                        options={data.countries}
                        isMultiple={true}
                        id="cboCountries"
                        name="cboCountries"
                        label="Regions"
                        labelId="cboCountriesLabel"
                        value={formik.values.cboCountries}
                        onChange={formik.handleChange}
                        disabled={formik.isSubmitting}
                      />
                    </Grid>
                  )}
                  {data.languages.length > 0 && (
                    <Grid item xs={6}>
                      <SoomSelect
                        dataTestId="cboLanguages"
                        ariaLabel="Languages"
                        options={data.languages}
                        isMultiple={true}
                        id="cboLanguages"
                        name="cboLanguages"
                        label="Languages"
                        labelId="cboLanguagesLabel"
                        value={formik.values.cboLanguages}
                        onChange={formik.handleChange}
                        disabled={formik.isSubmitting}
                      />
                    </Grid>
                  )}
                  {doctorAudience && (
                    <Grid item xs={6}>
                      <SoomSelect
                        dataTestId="cboAudience"
                        ariaLabel="Audience"
                        options={audienceOptions}
                        id="audience"
                        name="audience"
                        label="Audience"
                        labelId="audienceLabel"
                        value={formik.values.audience}
                        onChange={formik.handleChange}
                        disabled={formik.isSubmitting}
                      />
                    </Grid>
                  )}
                  {BUState.show && (
                    <Grid item xs={6}>
                      <SoomSelect
                        dataTestId="businessUnit"
                        ariaLabel="businessUnitLabel"
                        options={BUState.options}
                        id="businessUnit"
                        name="businessUnit"
                        label="Business Unit"
                        value={formik.values.businessUnit}
                        onChange={formik.handleChange}
                        disabled={formik.isSubmitting}
                      />
                    </Grid>
                  )}
                  <Grid item xs={6}>
                    <SoomSelect
                      dataTestId="database"
                      ariaLabel="databaseLabel"
                      options={databases}
                      id="database"
                      name="database"
                      label="Database"
                      value={formik.values.database}
                      onChange={formik.handleChange}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <SoomSwitch
                      color="primary"
                      isChecked={formik.values.swSafetyUpdate}
                      name="swSafetyUpdate"
                      label="Safety update"
                      handleOnChange={formik.handleChange}
                      className={styles.swSafetyUpdate}
                      dataTestId="swSafetyUpdate"
                    />
                  </Grid>
                </Grid>

                {formik.values.database === defaultDatabase.value && (
                  <>
                    <Divider sx={{ mt: 2 }} />
                    <Grid container spacing={2} pt={2}>
                      <Grid item xs={6}>
                        <SoomTextField
                          dataTestId="txtDefinition"
                          ariaLabel="txtDefinitionLabel"
                          id="txtDefinition"
                          name="txtDefinition"
                          variant="outlined"
                          label="Custom Definition"
                          placeholder="Enter a custom definition"
                          multiline
                          rows={4}
                          value={formik.values.txtDefinition}
                          handlerOnChange={formik.handleChange}
                          error={formik.touched.txtDefinition && Boolean(formik.errors.txtDefinition)}
                          helperText={formik.touched.txtDefinition && formik.errors.txtDefinition}
                          className={styles[`soom-dashboard-inputsize`]}
                          disabled={formik.isSubmitting}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <SoomTextField
                          dataTestId="txtDescription"
                          ariaLabel="txtDescriptionLabel"
                          id="txtDescription"
                          name="txtDescription"
                          variant="outlined"
                          label="Custom Description"
                          placeholder="Enter a custom description"
                          multiline
                          rows={4}
                          value={formik.values.txtDescription}
                          handlerOnChange={formik.handleChange}
                          error={formik.touched.txtDescription && Boolean(formik.errors.txtDescription)}
                          helperText={formik.touched.txtDescription && formik.errors.txtDescription}
                          className={styles[`soom-dashboard-inputsize`]}
                          disabled={formik.isSubmitting}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} pt={2}>
                      <Grid item xs={12}>
                        <MuiChipsInput
                          fullWidth
                          id="txtGTIN"
                          name="txtGTIN"
                          label="Custom GTINs"
                          placeholder={`Type and press enter. e.g. ABC123 "enter" XYZ664 "enter"`}
                          value={formik.values.txtGTIN}
                          onChange={(chips) => {
                            formik.setFieldValue('txtGTIN', chips);
                          }}
                          onKeyDown={(e) => {
                            // block ',' for conflicts with the functionality
                            if (e.key === ',') {
                              e.preventDefault();
                              return false;
                            }
                          }}
                          error={formik.touched.txtGTIN && Boolean(formik.errors.txtGTIN)}
                          helperText={
                            formik.touched.txtGTIN && formik.errors.txtGTIN ? String(formik.errors.txtGTIN) : undefined
                          }
                          disabled={formik.isSubmitting}
                        />
                      </Grid>
                    </Grid>
                    <Divider sx={{ mt: 2 }} />
                  </>
                )}

                <Grid container spacing={2} pt={2}>
                  <Grid item xs={3} />
                  <Grid item xs={6} pt={2}>
                    <DropzoneArea
                      data-test-id="dropzoneUploadDocument"
                      maxFileSize={maxFileSizeUpload}
                      filesLimit={1}
                      acceptedFiles={['.pdf', '.xlsx', '.docx']}
                      alertSnackbarProps={{ anchorOrigin: { vertical: 'top', horizontal: 'right' } }}
                      dropzoneClass={styles[`soom-dashboard-dropzone`]}
                      useChipsForPreview
                      dropzoneText={dropzoneText}
                      onChange={handleFileUpload}
                      onDelete={onFileUploadCancel}
                      dropzoneParagraphClass={styles['dropzone-text']}
                    />
                  </Grid>
                </Grid>
                <Divider className={styles.divider__buttons} />
                {showAlert && (
                  <SoomAlert dataTestId="msgSuccess" ariaLabel="Message" severity="success">
                    <SoomTypography
                      dataTestId="msgSuccessText"
                      ariaLabel="The document was successfully created. You will be redirected in a second..."
                      text="The document was successfully created. You will be redirected in a second..."
                      variant="body1"
                      component="span"
                    />
                  </SoomAlert>
                )}
                {showErrorAlert && (
                  <SoomAlert dataTestId="msgError" ariaLabel="Message" severity="error">
                    <SoomTypography
                      dataTestId="msgErrorText"
                      ariaLabel="There was an error trying to create the document"
                      text="There was an error trying to create the document"
                      variant="body1"
                      component="span"
                    />
                  </SoomAlert>
                )}
                <div className={styles.buttons__container}>
                  <SoomButton
                    dataTestId="btnCancel"
                    ariaLabel="Cancel"
                    variant="outlined"
                    handlerOnClick={handleCancel}
                    label="Cancel"
                    disabled={formik.isSubmitting}
                  />
                  <SoomButton
                    dataTestId="btnSubmit"
                    ariaLabel="Save"
                    variant="contained"
                    handlerOnClick={(e) => {
                      e.preventDefault();
                      if (formik.values.txtCFN.length <= 0) {
                        handleOpenConfirm();
                      } else {
                        formik.handleSubmit();
                      }
                    }}
                    label="Save"
                    type="submit"
                    loading={formik.isSubmitting}
                    disabled={
                      formik.values.txtDocumentNumber === '' ||
                      formik.values.txtRevision === '' ||
                      formik.values.txtBrandName === '' ||
                      !file
                    }
                  />
                </div>
              </form>
            </SoomCard>
          </Box>

          <Dialog
            fullWidth
            open={confirmState.open}
            onClose={handleCloseConfirm}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            data-test-id="dialogConfirm"
          >
            <DialogTitle id="confirm-dialog-title" style={{ padding: '15px' }}>
              Confirm
            </DialogTitle>
            <Divider />

            <DialogContent style={{ padding: '15px' }}>
              <DialogContentText id="confirm-dialog-description">
                CFNs or products codes are not required, but are needed to retrieve your products and more information
                for the document. Do you want to continue?
              </DialogContentText>
            </DialogContent>
            <Divider />
            <DialogActions style={{ padding: '15px' }}>
              <div className={styles.buttons__container} style={{ margin: '0' }}>
                <SoomButton
                  dataTestId="btnCancel"
                  ariaLabel="Cancel"
                  variant="outlined"
                  label="Cancel"
                  handlerOnClick={handleCloseConfirm}
                />{' '}
                <SoomButton
                  dataTestId="btnContinue"
                  ariaLabel="Continue"
                  variant="contained"
                  label="Continue"
                  handlerOnClick={() => {
                    handleCloseConfirm();
                    formik.handleSubmit();
                  }}
                />
              </div>
            </DialogActions>
          </Dialog>
        </>
      )}
    </PageWrapper>
  );
});
