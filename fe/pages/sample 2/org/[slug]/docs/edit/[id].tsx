/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
// auth0 authentication & react, next
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { get as _get, find as _find, filter as _filter } from 'lodash';
import getConfig from 'next/config';
import Link from 'next/link';

// material ui stuff
import {
  Box,
  Grid,
  Stack,
  Fab,
  DialogActions,
  DialogContent,
  DialogContentText,
  Dialog,
  DialogTitle,
  Chip,
  Typography,
  Button
} from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';

// icons
import {
  Mode,
  PublishOutlined,
  CancelOutlined,
  GradingOutlined,
  FileOpen,
  Cancel as CancelIcon
} from '@mui/icons-material';

// formik and yup
import * as yup from 'yup';
import { useFormik } from 'formik';

// md5 to hash files
import md5 from 'crypto-js/md5';

// soom-ui and others
import {
  SoomAlert,
  SoomButton,
  SoomCard,
  SoomSelect,
  SoomSwitch,
  SoomTextField,
  SoomTypography
} from '@soom-universe/soom-ui';
import PageWrapper from '../../../../../wrappers/pageWrapper';

// set otp
import { MuiOtpInput } from 'mui-one-time-password-input';

// styles
import styles from './index.module.scss';
import Divider from '@mui/material/Divider';

// helpers
import {
  requestGetProfileByEmailOrg,
  requestGetDocument,
  requestUpdateDocument,
  requestUpdatePublishedDocument,
  requestUpdateDocumentStatus,
  requestGetSigningPin,
  requestPostSigningPin,
  requestPutSigningPin,
  requestGetDatabases
} from '../../../../../helpers/request';
import { hasPermission, Permissions, hasAccess } from '../../../../../helpers/PermissionValidator';
import { getSignedUrl } from '../../../../../helpers/S3';

// get soom constants
import {
  documentStatuses,
  documentTypes,
  defaultDocumentTypes,
  audienceDefault,
  audienceOptions,
  defaultDatabase
} from '@soom-universe/soom-utils/constants';

// get public runtime settings
const {
  publicRuntimeConfig: {
    appName,
    documents: {
      list: { filtersState }
    }
  }
} = getConfig();

type updateStatusDataType = {
  app: string;
  org: string;
  document_number: string;
  status_to: string;
  key: string[];
  email: string;
  reject_reason?: string;
  edit_reason?: string;
  database: string;
};

type FormikValues = {
  cboLanguages: string[];
  cboStatus: string;
  cboCountries: string[];
  cboDocsTypes: string;
  txtDocumentNumber: string;
  txtRevision: string;
  txtBrandName: string;
  txtAlternateBrandName: string[];
  txtDefinition: string;
  txtDescription: string;
  txtCFN: string[];
  txtGTIN: string[];
  swSafetyUpdate: boolean;
  audience: string;
  reasonForEditing: string;
  businessUnit: string;
  database: string;
};

const defaultErrorMessage = 'There was an error trying to update the document.';
const defaultReasonMessage = 'Please enter a rejection reason';

export default withPageAuthRequired(function Edit({ user }) {
  const router = useRouter();

  const [otpOpen, setOtpOpen] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [doctorAudience, setDoctorAudience] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [showErrorText, setErrorText] = useState<string>(defaultErrorMessage);
  const [rejectReason, setRejectReason] = useState<string>(undefined);
  const [showWarningAlert, setShowWarningAlert] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [data, setData] = useState({
    countries: [],
    languages: [],
    docsTypes: [],
    statuses: documentStatuses
  });

  const [org, setOrg] = useState<string>(undefined);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(undefined);
  const [pageAccess, setPageAccess] = useState(false);
  const [title, setTitle] = useState('{Title}');
  const [loadingDocument, setLoadingDocument] = useState(true);
  const [errorDocument, setErrorDocument] = useState(false);
  const [document, setDocument] = useState({
    audience: '',
    firstApplicableLotNumber: '',
    expiryDate: '',
    siteName: '',
    documentNumber: '',
    documentName: '',
    safetyUpdate: '',
    dateOfIssue: '',
    lastApplicableLotNumber: '',
    id: '',
    file: '',
    status: undefined
  });
  const [canEdit /* , setCanEdit */] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [statusIsDisabled, setStatusIsDisabled] = useState(false);
  const [canSendToReview, setCanSendToReview] = useState<boolean>(false);
  const [canPublish, setCanPublish] = useState<boolean>(false);
  const [canReject, setCanReject] = useState<boolean>(false);
  const [canSendToDraftFromPublished, setCanSendToDraftFromPublished] = useState<boolean>(false);
  const [canSendToDraftFromRejected, setCanSendToDraftFromRejected] = useState<boolean>(false);
  const [otpInProgress, setOtpInProgress] = useState<boolean>(false);
  const [otpAction, setOtpAction] = useState<string>(undefined);
  const [loadingDatabases, setLoadingDatabases] = useState(true);
  const [databases, setDatabases] = useState([]);

  // pin signature key
  const [pinSignatureKey, setPinSignatureKey] = useState<string>(undefined);

  // dialog
  const [confirmState, setConfirmState] = useState({ open: false, fromSendForReview: false });

  // published documents
  const [isPublished, setIsPublished] = useState<boolean>(false);

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
      const pageAccess = hasAccess('editDoc', profile);
      const countries = _get(profile, 'organizationProfiles.0.configuration.regions', []);
      const languages = _get(profile, 'organizationProfiles.0.configuration.languages', []);
      const doctorAudience = _get(profile, 'organizationProfiles.0.configuration.doctor_audience', false);
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

      setData({ ...data, countries, languages, docsTypes });
      setDoctorAudience(doctorAudience);
      setProfile(profile);
      setPageAccess(pageAccess);
      setLoadingProfile(false);
    };

    fetchProfileData();
  }, [org]);

  useEffect(() => {
    if (!profile || !pageAccess) return;

    const fetchDocumentData = async () => {
      // get status and file
      const { id } = router.query;

      // get document metadata
      const document = await requestGetDocument({
        app: appName,
        org,
        key: id.toString()
      });

      if (!document) {
        setErrorDocument(true);
        setLoadingDocument(false);
        return;
      }

      let status = document.status;
      if (status === 'unpublished') {
        status = 'draft';
      } else if (status === 'pending') {
        status = 'in_review';
      }

      // validate document status
      if (getStatusLabel(status) === '') {
        setErrorDocument(true);
        setLoadingDocument(false);
        return;
      }

      // update states
      formik.setFieldValue('audience', document.audience);
      formik.setFieldValue('txtDocumentNumber', document.documentNumber);
      formik.setFieldValue('txtRevision', document.revision);
      formik.setFieldValue('txtBrandName', document.brandName);
      formik.setFieldValue(
        'txtAlternateBrandName',
        document.alternateBrandName === null ? [] : document.alternateBrandName.split(',')
      );
      formik.setFieldValue('txtDefinition', document.definition === null ? '' : document.definition[0]);
      formik.setFieldValue('txtDescription', document.description === null ? '' : document.description[0]);
      formik.setFieldValue('txtCFN', document.cfn === null ? [] : document.cfn);
      formik.setFieldValue('txtGTIN', document.gtins === null ? [] : document.gtins);
      formik.setFieldValue(
        'cboLanguages',
        _filter(document.language, (lang) => {
          return Boolean(
            _find(data.languages, (lang2) => {
              return lang2.value === lang;
            })
          );
        })
      );
      formik.setFieldValue(
        'cboCountries',
        _filter(document.region, (reg) => {
          return Boolean(
            _find(data.countries, (reg2) => {
              return reg2.value === reg;
            })
          );
        })
      );
      formik.setFieldValue('swSafetyUpdate', document.safetyUpdate);
      formik.setFieldValue('cboDocsTypes', document.type);
      formik.setFieldValue('cboStatus', status);
      formik.setFieldValue(
        'businessUnit',
        document.businessUnit && document.businessUnit !== '' ? document.businessUnit : '-1'
      );
      formik.setFieldValue('database', document.database || defaultDatabase.value);

      // validations
      // if (!document.latest_revision && (status === 'published' || status === 'rejected')) {
      // if (!document.latest_revision && status === 'published') {
      //   setCanEdit(false);
      // }

      if (status === 'published') {
        setIsPublished(true);
      }

      setDocument(document);
      setLoadingDocument(false);
    };

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

    fetchDocumentData();
    fetchDatabaseData();
  }, [profile, pageAccess]);

  useEffect(() => {
    if (!profile || !document) return;
    setCanSendToReview(hasPermission(Permissions.SEND_DOCUMENT_TO_REVIEW, profile));
    setCanPublish(hasPermission(Permissions.PUBLISH_DOCUMENT, profile));
    setCanReject(hasPermission(Permissions.REJECT_DOCUMENT, profile));
    setCanSendToDraftFromPublished(hasPermission(Permissions.SEND_DOCUMENT_BACK_TO_DRAFT_FROM_PUBLISHED, profile));

    setCanSendToDraftFromRejected(hasPermission(Permissions.SEND_DOCUMENT_BACK_TO_DRAFT_FROM_REJECTED, profile));

    if (document.status === 'pending' && (!canPublish || !canReject)) {
      setStatusIsDisabled(true);
    }
    if (document.status === 'draft' && !canSendToReview) {
      setStatusIsDisabled(true);
    }
    if (document.status === 'published' && !canSendToDraftFromPublished) {
      setStatusIsDisabled(true);
    }
    if (document.status === 'rejected' && !canSendToDraftFromRejected) {
      setStatusIsDisabled(true);
    }
  }, [document.status, profile]);

  useEffect(() => {
    if (!router.isReady) return;
    setTitle(document.documentName);
  }, [router.isReady, document]);

  useEffect(() => {
    if (document.status !== undefined) {
      const updateStatuses = {
        unpublished: [
          { value: 'draft', label: 'Draft' },
          { value: 'in_review', label: 'In Review' }
        ],
        pending: [
          { value: 'in_review', label: 'In Review' },
          { value: 'published', label: 'Published' },
          { value: 'rejected', label: 'Rejected' }
        ],
        published: [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' }
        ],
        rejected: [
          { value: 'draft', label: 'Draft' },
          { value: 'rejected', label: 'Rejected' }
        ]
      };

      setData({
        ...data,
        statuses: updateStatuses[document.status] || []
      });
    }
  }, [profile, document]);

  let validationSchema = yup.object({
    txtDocumentNumber: yup.string().required('Document number is required'),
    txtRevision: yup.string().required('The revision is required'),
    txtBrandName: yup.string().required('The brand name is required')
  });
  if (isPublished) {
    validationSchema = yup.object({
      txtDocumentNumber: yup.string().required('Document number is required'),
      txtRevision: yup.string().required('The revision is required'),
      txtBrandName: yup.string().required('The brand name is required'),
      cboLanguages: yup.array().min(1, 'At least one language is required to send the document for reviews'),
      reasonForEditing: yup.string().required('The reason for editing is required')
    });
  }

  const formik = useFormik({
    initialValues: {
      cboLanguages: [],
      cboStatus: '',
      cboCountries: [],
      cboDocsTypes: '',
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
      reasonForEditing: '',
      businessUnit: '-1',
      database: defaultDatabase.value
    } as FormikValues,
    validationSchema,
    onSubmit: async (values) => {
      if (!canEdit) return;

      setShowAlert(false);
      setShowErrorAlert(false);
      setShowWarningAlert(false);

      try {
        const { organizationProfiles } = profile;

        if (organizationProfiles.length > 0) {
          let updateResult;
          if (!isPublished) {
            // lets prepare object to send
            const updateDocumentData = {
              app: appName,
              org,
              audience: values.audience,
              first_applicable_lot_number: document.firstApplicableLotNumber || '',
              document_number: values.txtDocumentNumber,
              expiry_date: document.expiryDate || '',
              language: values.cboLanguages,
              brand_name: values.txtBrandName,
              cfn: values.txtCFN,
              type: values.cboDocsTypes || 'eIFU',
              business_unit: values.businessUnit !== '-1' ? values.businessUnit : undefined,
              revision: values.txtRevision,
              safety_update: values.swSafetyUpdate,
              date_of_issue: document.dateOfIssue,
              last_applicable_lot_number: document.lastApplicableLotNumber || '',
              region: values.cboCountries,
              alternate_brand_name: values.txtAlternateBrandName,
              key: document.id,
              database: values.database,
              definition: undefined,
              description: undefined,
              gtins: undefined
              // site_name: document.siteName || '',
              // document_name: document.documentName,
              // email: user.email,
              // s3_region: 'us-east-1'
            };

            if (formik.values.database === defaultDatabase.value) {
              updateDocumentData.definition =
                values.txtDefinition && values.txtDefinition !== '' ? [values.txtDefinition] : [];
              updateDocumentData.description =
                values.txtDescription && values.txtDescription !== '' ? [values.txtDescription] : [];
              updateDocumentData.gtins = values.txtGTIN;
            }

            updateResult = await requestUpdateDocument(updateDocumentData);
          } else {
            // lets prepare object to send
            const updateDocumentData = {
              app: appName,
              org,
              safety_update: values.swSafetyUpdate,
              edit_reason: `Published again by ${user.email}. Reason: ${formik.values.reasonForEditing}`,
              language: values.cboLanguages,
              brand_name: values.txtBrandName,
              cfn: values.txtCFN,
              region: values.cboCountries,
              alternate_brand_name: values.txtAlternateBrandName,
              type: values.cboDocsTypes || 'eIFU',
              business_unit: values.businessUnit !== '-1' ? values.businessUnit : undefined,
              email: user.email,
              key: document.id,
              database: values.database,
              definition: undefined,
              description: undefined,
              gtins: undefined
            };

            if (formik.values.database === defaultDatabase.value) {
              updateDocumentData.definition =
                values.txtDefinition && values.txtDefinition !== '' ? [values.txtDefinition] : [];
              updateDocumentData.description =
                values.txtDescription && values.txtDescription !== '' ? [values.txtDescription] : [];
              updateDocumentData.gtins = values.txtGTIN;
            }

            updateResult = await requestUpdatePublishedDocument(updateDocumentData);
          }

          if (!updateResult) {
            setShowErrorAlert(true);
            return;
          }
          setShowAlert(true);
        } else {
          setShowErrorAlert(true);
        }
      } catch (error) {
        console.error(error);
        setShowErrorAlert(true);
      }
    }
  });

  // this is to handle the form cancel button
  const handleCancel = () => {
    router.push(`/org/${org}`);
  };

  const resetDataLoading = () => {
    setOtpInProgress(false);
    setSubmitting(false);
    setOtpAction(undefined);
    setOtp(undefined);
  };

  const handleOtpClose = () => {
    resetDataLoading();
    setIsEditing(false);
    setOtpOpen(false);
    setShowWarningAlert(false);
  };

  const handleOtpConfirm = async () => {
    setOtpOpen(false);
    const getPin = await requestGetSigningPin({
      signatureKey: pinSignatureKey,
      pin: otp,
      profileId: parseInt(profile.profile_id)
    });
    resetDataLoading();
    setShowWarningAlert(false);

    const otpIsValid = getPin !== null;
    if (otpIsValid) {
      try {
        await requestPutSigningPin({ signatureKey: pinSignatureKey });
        if (otpAction === 'publish') {
          await handlePublish();
        } else if (otpAction === 'reject') {
          await handleReject();
        } else if (otpAction === 'edit') {
          await handleEditDocument();
        }
      } catch (error) {
        console.error(error);
        setErrorText('An error ocurred trying to update the document.');
        setShowErrorAlert(true);
      }
    } else {
      setErrorText('The PIN that you entered is incorrect. Try again.');
      setShowErrorAlert(true);
    }
  };

  const handleChangeOtp = (newValue) => {
    setOtp(newValue);
  };

  const getStatusLabel = (slug: string): string => {
    if (slug !== undefined) {
      const searchItem = filtersState.status.find((o) => o.slug === slug);
      if (searchItem && searchItem.name) {
        return searchItem.name;
      }
    }
    return '';
  };

  const getStatusColor = (
    slug: string
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (slug !== undefined) {
      const searchItem = filtersState.status.find((o) => o.slug === slug);
      if (searchItem && searchItem.color) {
        return searchItem.color;
      }
    }
    return 'default';
  };

  const showOtpForm = async (action: string) => {
    setOtpOpen(true);
    setSubmitting(false);
    setShowWarningAlert(true);
    setOtpAction(action);

    // let's create the pin
    const signature = md5(`${profile.profile_id}+action_${formik.values.cboStatus}+${Date.now()}`);
    setPinSignatureKey(signature);
    await requestPostSigningPin({
      email: user.email,
      profile_id: profile.profile_id,
      action_name: `action_${formik.values.cboStatus}`,
      signature_key: signature.toString(),
      expires_on: new Date(Date.now() + 5 * 60000).toISOString()
    });

    setOtpInProgress(true);
  };

  // handle actions
  const handleEditDocument = async () => {
    try {
      if (!canEdit) return;

      setSubmitting(true);
      // first we are updating the document
      formik.submitForm().then(async () => {
        if (!isPublished) {
          const updateStatusData: updateStatusDataType = {
            app: appName,
            org,
            document_number: document.documentNumber,
            status_to: 'unpublished',
            key: [document.id],
            email: user.email,
            edit_reason: `Sent back to draft by ${user.email}`,
            database: formik.values.database
          };
          await requestUpdateDocumentStatus(updateStatusData);
        }

        router.reload();
        // resetDataLoading();
      });
    } catch (error) {
      console.error(error);
      resetDataLoading();
    }
  };

  const handleSendForReview = async () => {
    try {
      if (!canEdit) return;

      setSubmitting(true);
      // validate languages for send to review
      const langs = formik.values.cboLanguages;
      if (langs.length <= 0) {
        await formik.setFieldTouched('cboLanguages', true);
        formik.setFieldError('cboLanguages', 'At least one language is required to send the document for review');
        resetDataLoading();
        return;
      }

      // first we are updating the document
      formik.submitForm().then(async () => {
        const updateStatusData: updateStatusDataType = {
          app: appName,
          org,
          document_number: document.documentNumber,
          status_to: 'pending',
          key: [document.id],
          email: user.email,
          edit_reason: `Sent from review by ${user.email}`,
          database: formik.values.database
        };
        await requestUpdateDocumentStatus(updateStatusData);

        router.reload();
        // resetDataLoading();
      });
    } catch (error) {
      console.error(error);
      resetDataLoading();
    }
  };

  const handlePublish = async () => {
    try {
      if (!canEdit) return;

      setSubmitting(true);
      const updateStatusData: updateStatusDataType = {
        app: appName,
        org,
        document_number: document.documentNumber,
        status_to: 'published',
        key: [document.id],
        email: user.email,
        edit_reason: `Published by ${user.email}`,
        database: formik.values.database
      };
      await requestUpdateDocumentStatus(updateStatusData);

      router.reload();
      // resetDataLoading();
    } catch (error) {
      console.error(error);
      resetDataLoading();
    }
  };

  const handleReject = async () => {
    try {
      if (!canEdit) return;

      setSubmitting(true);
      const updateStatusData: updateStatusDataType = {
        app: appName,
        org,
        document_number: document.documentNumber,
        status_to: 'rejected',
        key: [document.id],
        email: user.email,
        reject_reason: rejectReason !== undefined && rejectReason !== '' ? rejectReason : `Rejected by ${user.email}`,
        database: formik.values.database
      };
      await requestUpdateDocumentStatus(updateStatusData);

      router.reload();
      // resetDataLoading();
    } catch (error) {
      console.error(error);
      resetDataLoading();
    }
  };

  const handleOpenConfirm = (fromSendForReview) => {
    setConfirmState({ open: true, fromSendForReview });
  };

  const handleCloseConfirm = () => {
    setConfirmState({ open: false, fromSendForReview: false });
  };

  return (
    <PageWrapper
      org={org}
      profile={profile}
      loading={loadingProfile || (pageAccess && loadingDocument) || (pageAccess && loadingDatabases)}
      pageAccess={pageAccess}
    >
      {errorDocument ? (
        <Box sx={{ flexGrow: 1 }} className={styles.form__container}>
          <SoomCard dataTestId="cardNewDocument" ariaLabel="prueba">
            <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
              <Typography variant="h6" component="div">
                <FileOpen sx={{ verticalAlign: 'middle' }} /> Editing document
              </Typography>
            </Stack>
            <Divider className={styles.divider__header} />
            <Grid container spacing={2} pt={2} style={{ minHeight: '500px' }}>
              <Grid item xs={12}>
                <SoomAlert
                  dataTestId="WarningAlertDiv"
                  ariaLabel="WarningAlertDiv"
                  severity="error"
                  sx={{ mb: 2, mx: 2 }}
                >
                  <SoomTypography
                    dataTestId="warningMessage"
                    ariaLabel="warningMessage"
                    text={
                      <>
                        Document information not found. Go back to{' '}
                        <Link legacyBehavior href={`/org/${org}`}>
                          <a
                            rel="noopener"
                            className={styles['soom-eifu-link']}
                            style={{ textDecoration: 'underline' }}
                          >
                            <strong>the document list</strong>
                          </a>
                        </Link>{' '}
                        and select your document.
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
        <Box className={styles.form__container}>
          <SoomCard dataTestId="cardEditDocument" ariaLabel="prueba">
            <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
              <SoomTypography
                dataTestId={title}
                ariaLabel={title}
                text={`Editing document: ${title}`}
                variant="h6"
                component="h6"
                align="left"
              />

              <Chip label={getStatusLabel(formik.values.cboStatus)} color={getStatusColor(formik.values.cboStatus)} />
              <Button
                variant="outlined"
                aria-label="document"
                color="primary"
                size="small"
                onClick={async () => {
                  const bucket = _get(profile, 'organizationProfiles.0.configuration.bucket', '');
                  const signedUrl = await getSignedUrl(bucket, `${document.status}/${document.id}`);
                  window.open(signedUrl, '_blank').focus();
                }}
                startIcon={<FileOpen />}
              >
                Open
              </Button>
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
                    disabled={true}
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
                    disabled={true}
                  />
                </Grid>
                <Grid item xs={4}>
                  <SoomSelect
                    dataTestId="cboDocsTypes"
                    ariaLabel="Document type"
                    options={data.docsTypes}
                    isMultiple={false}
                    id="cboDocsTypes"
                    name="cboDocsTypes"
                    label="Document type"
                    labelId="cboDocsTypesLabel"
                    value={formik.values.cboDocsTypes}
                    onChange={formik.handleChange}
                    disabled={
                      formik.isSubmitting ||
                      submitting ||
                      (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                    }
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} pt={2}>
                <Grid item xs={4}>
                  <SoomTextField
                    dataTestId="txtBrandName"
                    ariaLabel="Brand name"
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
                    disabled={
                      formik.isSubmitting ||
                      submitting ||
                      (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                    }
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
                    disabled={
                      formik.isSubmitting ||
                      submitting ||
                      (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                    }
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
                    disabled={
                      formik.isSubmitting ||
                      submitting ||
                      (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                    }
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
                      disabled={
                        formik.isSubmitting ||
                        submitting ||
                        (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                      }
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
                      error={formik.touched.cboLanguages && Boolean(formik.errors.cboLanguages)}
                      textError={
                        formik.touched.cboLanguages && formik.errors.cboLanguages
                          ? String(formik.errors.cboLanguages)
                          : undefined
                      }
                      disabled={
                        formik.isSubmitting ||
                        submitting ||
                        (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                      }
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
                      disabled={
                        formik.isSubmitting ||
                        submitting ||
                        isPublished ||
                        (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                      }
                    />
                  </Grid>
                )}
                {BUState.show && (
                  <Grid item xs={6}>
                    <SoomSelect
                      dataTestId="BusinessUnit"
                      ariaLabel="BusinessUnitLabel"
                      options={BUState.options}
                      id="businessUnit"
                      name="businessUnit"
                      label="Business Unit"
                      value={formik.values.businessUnit}
                      onChange={formik.handleChange}
                      disabled={
                        formik.isSubmitting ||
                        submitting ||
                        (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                      }
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
                    disabled={
                      formik.isSubmitting ||
                      submitting ||
                      (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                    }
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
                    disabled={
                      formik.isSubmitting ||
                      submitting ||
                      (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                    }
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
                        disabled={
                          formik.isSubmitting ||
                          submitting ||
                          (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                        }
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
                        disabled={
                          formik.isSubmitting ||
                          submitting ||
                          (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                        }
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
                        disabled={
                          formik.isSubmitting ||
                          submitting ||
                          (['in_review', 'rejected', 'published'].includes(formik.values.cboStatus) && !isEditing)
                        }
                      />
                    </Grid>
                  </Grid>
                  <Divider sx={{ mt: 2 }} />
                </>
              )}

              <Grid container spacing={2} pt={2}>
                {isPublished && isEditing && (
                  <Grid item xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="txtReasonForEditing"
                      ariaLabel="Reason for editing"
                      id="reasonForEditing"
                      name="reasonForEditing"
                      variant="outlined"
                      label="Reason for editing"
                      placeholder="Enter the reason"
                      required={true}
                      value={formik.values.reasonForEditing}
                      handlerOnChange={formik.handleChange}
                      error={formik.touched.reasonForEditing && Boolean(formik.errors.reasonForEditing)}
                      helperText={formik.touched.reasonForEditing && formik.errors.reasonForEditing}
                      disabled={formik.isSubmitting || submitting}
                    />
                  </Grid>
                )}
              </Grid>
              <Divider className={styles.divider__buttons} />
              {showAlert && (
                <SoomAlert dataTestId="msgSuccess" ariaLabel="Message" severity="success">
                  <SoomTypography
                    dataTestId="msgSuccessText"
                    ariaLabel="The document was successfully updated"
                    text="The document was successfully updated"
                    variant="body1"
                    component="span"
                  />
                </SoomAlert>
              )}
              {showErrorAlert && (
                <SoomAlert dataTestId="msgError" ariaLabel="Message" severity="error">
                  <SoomTypography
                    dataTestId="msgErrorText"
                    ariaLabel={showErrorText}
                    text={showErrorText}
                    variant="body1"
                    component="span"
                  />
                </SoomAlert>
              )}
              {showWarningAlert && (
                <SoomAlert dataTestId="msgWarning" ariaLabel="Message" severity="warning">
                  <SoomTypography
                    dataTestId="msgWarningText"
                    ariaLabel="This action needs a secondary authorization."
                    text="This action needs a secondary authorization."
                    variant="body1"
                    component="span"
                  />
                </SoomAlert>
              )}
              <Grid container>
                <Grid item xs={6}>
                  {canEdit && (
                    <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 2 }}>
                      {formik.values.cboStatus === 'draft' && !statusIsDisabled && (
                        <Fab
                          disabled={formik.isSubmitting || submitting}
                          onClick={() => {
                            if (formik.values.txtCFN.length <= 0) {
                              handleOpenConfirm(true);
                            } else {
                              handleSendForReview();
                            }
                          }}
                          variant="extended"
                          size="medium"
                          sx={{
                            textTransform: 'none',
                            boxShadow: '0'
                          }}
                        >
                          <GradingOutlined sx={{ mr: 1 }} className={styles.action_button_review} />
                          Send for review
                        </Fab>
                      )}
                      {formik.values.cboStatus === 'in_review' && !statusIsDisabled && (
                        <Fab
                          disabled={formik.isSubmitting || submitting}
                          onClick={() => {
                            showOtpForm('publish');
                          }}
                          variant="extended"
                          size="medium"
                          sx={{
                            textTransform: 'none',
                            boxShadow: '0'
                          }}
                        >
                          <PublishOutlined sx={{ mr: 1 }} className={styles.action_button_publish} />
                          Publish
                        </Fab>
                      )}
                      {formik.values.cboStatus === 'in_review' && !statusIsDisabled && (
                        <Fab
                          disabled={formik.isSubmitting || submitting}
                          onClick={() => {
                            showOtpForm('reject');
                          }}
                          variant="extended"
                          size="medium"
                          sx={{
                            textTransform: 'none',
                            boxShadow: '0'
                          }}
                        >
                          <CancelOutlined sx={{ mr: 1 }} className={styles.action_button_reject} />
                          Reject
                        </Fab>
                      )}
                      {['published', 'rejected'].includes(formik.values.cboStatus) && !statusIsDisabled && (
                        <Fab
                          disabled={formik.isSubmitting || submitting}
                          onClick={() => {
                            setIsEditing(!isEditing);
                          }}
                          variant="extended"
                          size="medium"
                          sx={{
                            textTransform: 'none',
                            boxShadow: '0'
                          }}
                        >
                          {isEditing ? (
                            <CancelIcon sx={{ mr: 1 }} className={styles.action_button_draft} />
                          ) : (
                            <Mode sx={{ mr: 1 }} className={styles.action_button_draft} />
                          )}
                          {isEditing ? 'Cancel editing' : 'Edit'}
                        </Fab>
                      )}
                    </Stack>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <div className={styles.buttons__container}>
                    <SoomButton
                      dataTestId="btnCancel"
                      ariaLabel={canEdit ? `Cancel` : `Back`}
                      variant="outlined"
                      handlerOnClick={handleCancel}
                      label={canEdit ? `Cancel` : `Back`}
                      disabled={formik.isSubmitting || submitting}
                    />
                    {canEdit && (
                      <SoomButton
                        dataTestId="btnSubmit"
                        ariaLabel="Save"
                        variant="contained"
                        handlerOnClick={(e) => {
                          e.preventDefault();
                          if (isEditing) {
                            showOtpForm('edit');
                          } else if (formik.values.txtCFN.length <= 0) {
                            handleOpenConfirm(false);
                          } else {
                            formik.handleSubmit();
                          }
                        }}
                        label="Save"
                        type="submit"
                        loading={formik.isSubmitting || submitting}
                        disabled={
                          otpInProgress ||
                          formik.values.txtDocumentNumber === '' ||
                          formik.values.txtRevision === '' ||
                          formik.values.txtBrandName === '' ||
                          (isPublished && formik.values.reasonForEditing === '') ||
                          (['published', 'rejected', 'in_review'].includes(formik.values.cboStatus) && !isEditing)
                        }
                      />
                    )}
                  </div>
                </Grid>
              </Grid>
            </form>
          </SoomCard>

          <Dialog
            open={otpOpen}
            onClose={handleOtpClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            data-test-id="dialogAlert"
          >
            <DialogTitle id="alert-dialog-title">{`This process requires extra authorization`}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                <Stack spacing={3}>
                  <SoomTypography
                    component="h5"
                    variant="body1"
                    hasGutterBottom
                    text={` We sent an email to ${user.email} with a 6-digit PIN.`}
                  />
                  <Stack spacing={2}>
                    <MuiOtpInput length={6} value={otp} onChange={handleChangeOtp} />
                    {(otpAction === 'edit' && formik.values.cboStatus === 'rejected') ||
                      (otpAction === 'reject' && (
                        <SoomTextField
                          ariaLabel=""
                          dataTestId=""
                          id="reasonText"
                          variant="outlined"
                          placeholder={defaultReasonMessage}
                          handlerOnChange={(event: { target: { value } }) => {
                            setRejectReason(event.target.value);
                          }}
                          name="txtReasonText"
                        ></SoomTextField>
                      ))}
                    <Divider />
                  </Stack>
                </Stack>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <SoomButton
                variant="outlined"
                type="button"
                ariaLabel="closebtn"
                dataTestId="btnClose"
                handlerOnClick={handleOtpClose}
                label="Cancel"
              />
              <SoomButton
                variant="contained"
                type="button"
                ariaLabel="confirmbtn"
                dataTestId="btnConfirm"
                handlerOnClick={handleOtpConfirm}
                label="Confirm"
                disabled={
                  otp === undefined ||
                  otp.length < 6 ||
                  (otpAction === 'reject' && (rejectReason === undefined || rejectReason === ''))
                }
              />
            </DialogActions>
          </Dialog>

          <Dialog
            fullWidth
            open={confirmState.open}
            onClose={handleCloseConfirm}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
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
                    if (confirmState.fromSendForReview) {
                      handleSendForReview();
                    } else {
                      formik.handleSubmit();
                    }
                  }}
                />
              </div>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </PageWrapper>
  );
});
