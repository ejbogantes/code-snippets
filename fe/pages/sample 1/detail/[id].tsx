/* eslint-disable dot-notation */
/* eslint-disable react-hooks/exhaustive-deps */

// styles, react and nextjs
import styles from './index.module.scss';
import React, { useState, useEffect } from 'react';
import getConfig from 'next/config';
import { getCookie } from 'cookies-next';
import { get as _get, find as _find } from 'lodash';
import { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { DigitalDocument } from 'schema-dts';

// material ui
import {
  Box,
  Stack,
  Avatar,
  Grid,
  Divider,
  Typography,
  Fab,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Button
} from '@mui/material';

import {
  Pageview as PageviewIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';

// soom-ui
import { SoomAlert, SoomButton, SoomTextField, SoomTypography, SoomLoader, SoomCheckbox } from '@soom-universe/soom-ui';

// soom constants
import { audienceDefault } from '@soom-universe/soom-utils/constants';

// helpers
import clientConfigLoader from '../../helpers/clientConfigLoader';
import { requestDocumentDetail, requestPrintedVersion, requestSubscription } from '../../helpers/request';
import { getPageTranslation, Translation } from '../../helpers/translation';
import { getDocumentTypeLabel } from '../../helpers/documents';

// components
import Error404 from '../../pages/404';
import LangSelector from '../../components/LangSelector';
import RegionSelector from '../../components/RegionSelector';
import AudienceSelector from '../../components/AudienceSelector';

// formik and yup
import * as yup from 'yup';
import { useFormik } from 'formik';

// get public runtime settings
const {
  publicRuntimeConfig: { defaultLogo }
} = getConfig();

// change this to component
function FormModal(props) {
  const { translation, formModalState, formModalAlertState, formik, document, handleCloseModal } = props;
  const translationHelper = new Translation(translation);

  if (document === null) {
    return null;
  }

  return (
    <Modal open={formModalState.open} onClose={handleCloseModal} aria-labelledby="modal-modal-title">
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, -10%)',
          width: 800,
          bgcolor: 'background.paper',
          border: '1px solid #E8E8E8',
          borderRadius: '4px',
          p: 2,
          maxHeight: `calc(100vh - 100px)`,
          overflowY: 'auto'
        }}
      >
        <DialogTitle id="modal-modal-title" sx={{ py: 0, overflow: 'hidden' }}>
          <Typography variant="h5" component="div" sx={{ float: 'left' }}>
            {translationHelper.get('title', '')}
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ float: 'right' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item md={12} xs={12}>
              <DialogContentText>
                {translationHelper.get('description.preDocName', '')}{' '}
                <strong>&quot;{document.documentName}&quot;</strong>
                {translationHelper.get('description.posDocName', '')}
              </DialogContentText>
              <DialogContentText>
                <small>{translationHelper.get('smallDescription', '')}</small>
              </DialogContentText>
            </Grid>
            <Grid item md={12} xs={12}>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="firstName"
                      ariaLabel="First Name"
                      id="firstName"
                      name="firstName"
                      variant="outlined"
                      label={translationHelper.get('labels.firstName', '')}
                      placeholder={translationHelper.get('placeholders.firstName', '')}
                      required={true}
                      value={formik.values.firstName}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="lastName"
                      ariaLabel="Last Name"
                      id="lastName"
                      name="lastName"
                      variant="outlined"
                      label={translationHelper.get('labels.lastName', '')}
                      placeholder={translationHelper.get('placeholders.lastName', '')}
                      required={true}
                      value={formik.values.lastName}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="phone"
                      ariaLabel="Phone"
                      id="phone"
                      name="phone"
                      variant="outlined"
                      label={translationHelper.get('labels.phone', '')}
                      placeholder={translationHelper.get('placeholders.phone', '')}
                      required={true}
                      value={formik.values.phone}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="email"
                      ariaLabel="Email"
                      id="email"
                      name="email"
                      variant="outlined"
                      label={translationHelper.get('labels.email', '')}
                      placeholder={translationHelper.get('placeholders.email', '')}
                      required={true}
                      value={formik.values.email}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="street"
                      ariaLabel="Street"
                      id="street"
                      name="street"
                      variant="outlined"
                      label={translationHelper.get('labels.street', '')}
                      placeholder={translationHelper.get('placeholders.street', '')}
                      required={true}
                      value={formik.values.street}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.street && Boolean(formik.errors.street)}
                      helperText={formik.touched.street && formik.errors.street}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="city"
                      ariaLabel="City"
                      id="city"
                      name="city"
                      variant="outlined"
                      label={translationHelper.get('labels.city', '')}
                      placeholder={translationHelper.get('placeholders.city', '')}
                      required={true}
                      value={formik.values.city}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.city && Boolean(formik.errors.city)}
                      helperText={formik.touched.city && formik.errors.city}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="state"
                      ariaLabel="State"
                      id="state"
                      name="state"
                      variant="outlined"
                      label={translationHelper.get('labels.state', '')}
                      placeholder={translationHelper.get('placeholders.state', '')}
                      required={true}
                      value={formik.values.state}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.state && Boolean(formik.errors.state)}
                      helperText={formik.touched.state && formik.errors.state}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="country"
                      ariaLabel="Country"
                      id="country"
                      name="country"
                      variant="outlined"
                      label={translationHelper.get('labels.country', '')}
                      placeholder={translationHelper.get('placeholders.country', '')}
                      required={true}
                      value={formik.values.country}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.country && Boolean(formik.errors.country)}
                      helperText={formik.touched.country && formik.errors.country}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="postalCode"
                      ariaLabel="Postal Code"
                      id="postalCode"
                      name="postalCode"
                      variant="outlined"
                      label={translationHelper.get('labels.postalCode', '')}
                      placeholder={translationHelper.get('placeholders.postalCode', '')}
                      required={true}
                      value={formik.values.postalCode}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
                      helperText={formik.touched.postalCode && formik.errors.postalCode}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <SoomCheckbox
                      label={translationHelper.get('labels.consent', '')}
                      labelPlacement="end"
                      size="medium"
                      defaultChecked={formik.values.consent}
                      handlerOnChange={(event, checked) => {
                        formik.setFieldValue('consent', checked);
                      }}
                      handlerOnBlur={() => {
                        formik.setFieldTouched('consent', true);
                      }}
                      error={formik.touched.consent && Boolean(formik.errors.consent)}
                      helperText={formik.touched.consent && formik.errors.consent}
                    />
                  </Grid>
                </Grid>
                <Divider style={{ margin: '10px 0' }} />
                {formModalAlertState.open && (
                  <Grid container spacing={2}>
                    <Grid item md={12} xs={12} className={styles['soom-webapp__form-alert-container']}>
                      <SoomAlert ariaLabel="AlertDiv" severity={formModalAlertState.type}>
                        <SoomTypography
                          ariaLabel="AlertMessage"
                          text={formModalAlertState.message}
                          variant="body1"
                          component="span"
                        />
                      </SoomAlert>
                    </Grid>
                  </Grid>
                )}
                <div className={styles.buttons__container} style={{ margin: '15px 0' }}>
                  <SoomButton
                    dataTestId="btnCancel"
                    ariaLabel="Cancel"
                    variant="outlined"
                    handlerOnClick={handleCloseModal}
                    label={translationHelper.get('buttonCancelText', '')}
                    type="button"
                    disabled={formik.isSubmitting}
                  />{' '}
                  <SoomButton
                    dataTestId="btnSubmit"
                    ariaLabel="Request Version"
                    variant="contained"
                    handlerOnClick={formik.handleSubmit}
                    label={translationHelper.get('buttonSubmitText', '')}
                    type="submit"
                    loading={formik.isSubmitting}
                    disabled={!(formik.isValid && formik.dirty)}
                  />
                </div>
                <Divider style={{ margin: '10px 0' }} />
                <DialogContentText>
                  {translationHelper.get('privacyPolicy.preLinkText', '')}
                  <a
                    style={{ textDecoration: 'underline' }}
                    target="_blank"
                    href={translationHelper.get('privacyPolicy.linkUrl', '')}
                    rel="noopener noreferrer"
                  >
                    <strong>{translationHelper.get('privacyPolicy.linkText', '')}</strong>
                  </a>
                  {translationHelper.get('privacyPolicy.posLinkText', '')}
                </DialogContentText>
              </form>
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
    </Modal>
  );
}

function FormSubscribeModal(props) {
  const { translation, formSubscribeState, formSubscribeAlertState, formik, handleCloseModal } = props;
  const translationHelper = new Translation(translation);

  if (formSubscribeState.document === null) {
    return null;
  }

  return (
    <Modal open={formSubscribeState.open} onClose={handleCloseModal} aria-labelledby="modal-modal-title">
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, -10%)',
          width: 800,
          bgcolor: 'background.paper',
          border: '1px solid #E8E8E8',
          borderRadius: '4px',
          p: 2,
          maxHeight: `calc(100vh - 100px)`,
          overflowY: 'auto'
        }}
      >
        <DialogTitle id="modal-modal-title" sx={{ py: 0, overflow: 'hidden' }}>
          <Typography variant="h5" component="div" sx={{ float: 'left' }}>
            {translationHelper.get('title', '')}
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ float: 'right' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item md={12} xs={12}>
              <DialogContentText>
                {translationHelper.get('description.preDocName', '')}{' '}
                <strong>&quot;{formSubscribeState.document.documentName}&quot;</strong>
                {translationHelper.get('description.posDocName', '')}
              </DialogContentText>
              <DialogContentText>
                <small>{translationHelper.get('smallDescription', '')}</small>
              </DialogContentText>
            </Grid>
            <Grid item md={12} xs={12}>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="fullName"
                      ariaLabel="Full Name"
                      id="fullName"
                      name="fullName"
                      variant="outlined"
                      label={translationHelper.get('labels.fullName', '')}
                      placeholder={translationHelper.get('placeholders.fullName', '')}
                      value={formik.values.fullName}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                      helperText={formik.touched.fullName && formik.errors.fullName}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="email"
                      ariaLabel="Email"
                      id="email"
                      name="email"
                      variant="outlined"
                      label={translationHelper.get('labels.email', '')}
                      placeholder={translationHelper.get('placeholders.email', '')}
                      required={true}
                      value={formik.values.email}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="phone"
                      ariaLabel="Phone"
                      id="phone"
                      name="phone"
                      variant="outlined"
                      label={translationHelper.get('labels.phone', '')}
                      placeholder={translationHelper.get('placeholders.phone', '')}
                      value={formik.values.phone}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="profession"
                      ariaLabel="Profession"
                      id="profession"
                      name="profession"
                      variant="outlined"
                      label={translationHelper.get('labels.profession', '')}
                      placeholder={translationHelper.get('placeholders.profession', '')}
                      value={formik.values.profession}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.profession && Boolean(formik.errors.profession)}
                      helperText={formik.touched.profession && formik.errors.profession}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="organization"
                      ariaLabel="Organization"
                      id="organization"
                      name="organization"
                      variant="outlined"
                      label={translationHelper.get('labels.organization', '')}
                      placeholder={translationHelper.get('placeholders.organization', '')}
                      value={formik.values.organization}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.organization && Boolean(formik.errors.organization)}
                      helperText={formik.touched.organization && formik.errors.organization}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12}>
                    <SoomCheckbox
                      label={translationHelper.get('labels.consent', '')}
                      labelPlacement="end"
                      size="medium"
                      defaultChecked={formik.values.consent}
                      handlerOnChange={(event, checked) => {
                        formik.setFieldValue('consent', checked);
                      }}
                      handlerOnBlur={() => {
                        formik.setFieldTouched('consent', true);
                      }}
                      error={formik.touched.consent && Boolean(formik.errors.consent)}
                      helperText={formik.touched.consent && formik.errors.consent}
                    />
                  </Grid>
                </Grid>
                <Divider style={{ margin: '10px 0' }} />
                {formSubscribeAlertState.open && (
                  <Grid container spacing={2}>
                    <Grid item md={12} xs={12} className={styles['soom-webapp__form-alert-container']}>
                      <SoomAlert ariaLabel="AlertDiv" severity={formSubscribeAlertState.type}>
                        <SoomTypography
                          ariaLabel="AlertMessage"
                          text={formSubscribeAlertState.message}
                          variant="body1"
                          component="span"
                        />
                      </SoomAlert>
                    </Grid>
                  </Grid>
                )}
                <div className={styles.buttons__container} style={{ margin: '15px 0' }}>
                  <SoomButton
                    dataTestId="btnCancel"
                    ariaLabel="btnCancel"
                    variant="outlined"
                    handlerOnClick={handleCloseModal}
                    label={translationHelper.get('buttonCancelText', '')}
                    type="button"
                    disabled={formik.isSubmitting}
                  />{' '}
                  <SoomButton
                    dataTestId="btnSubmit"
                    ariaLabel="btnSubmit"
                    variant="contained"
                    handlerOnClick={formik.handleSubmit}
                    label={translationHelper.get('buttonSubmitText', '')}
                    type="submit"
                    loading={formik.isSubmitting}
                    disabled={!(formik.isValid && formik.dirty)}
                  />
                </div>
                <Divider style={{ margin: '10px 0' }} />
                <DialogContentText>
                  {translationHelper.get('privacyPolicy.preLinkText', '')}
                  <a
                    style={{ textDecoration: 'underline' }}
                    target="_blank"
                    href={translationHelper.get('privacyPolicy.linkUrl', '')}
                    rel="noopener noreferrer"
                  >
                    <strong>{translationHelper.get('privacyPolicy.linkText', '')}</strong>
                  </a>
                  {translationHelper.get('privacyPolicy.posLinkText', '')}
                </DialogContentText>
              </form>
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
    </Modal>
  );
}

export function Detail(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { config, company, features, translation, regionCookie, audienceCookie } = props;
  const translationHelper = new Translation(translation.data);

  const router = useRouter();
  const { locale } = router;

  const languages = _get(company, 'languages', []);
  const selectedLanguage = _find(languages, (language) => {
    return language.value === locale;
  });

  const regions = _get(company, 'regions', []);
  const selectedRegion = _find(regions, (region) => {
    return region.value === regionCookie;
  });

  // data
  const [isLoadingDocument, setIsLoadingDocument] = useState<boolean>(true);
  const [document, setDocument] = useState(null);

  // languages
  const [openLangs, setOpenLangs] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState(selectedLanguage || languages[0]);

  // countries/regions
  const [selectedReg] = useState(selectedRegion || regions[0]);

  // audience
  const [selectedAudience] = useState(audienceCookie || audienceDefault);

  // modal
  const [formModalState, setFormModalState] = useState({ open: false });
  const [formModalAlertState, setFormModalAlertState] = useState({
    open: false,
    type: 'success',
    message: ''
  });

  // modal subscribe
  const [formSubscribeState, setFormSubscribeState] = useState({ open: false, document: null });
  const [formSubscribeAlertState, setFormSubscribeAlertState] = useState({
    open: false,
    type: 'success',
    message: ''
  });

  // dialog
  const [safetyDialogState, setSafetyDialogState] = useState({
    open: false,
    type: 'document',
    openDialog: false
  });
  const [versionDialogState, setVersionDialogState] = useState({
    open: false,
    type: 'document'
  });

  useEffect(() => {
    if (!router.isReady) return;

    const fetchDocumentData = async (id: string) => {
      const documentResult = await requestDocumentDetail(
        {
          bucket: config.bucketName,
          key: id
        },
        { 'Accept-Language': locale }
      );

      if (documentResult) {
        setDocument(documentResult);
      }

      setIsLoadingDocument(false);
    };

    // get search value from query when router is ready
    const id = router.query.id.toString() || '';
    fetchDocumentData(id);
  }, [router.isReady]);

  const handleClickLangs = () => {
    setOpenLangs(true);
  };

  const handleCloseLangs = (value) => {
    setOpenLangs(false);
    setSelectedLang(value);
  };

  const handleOpenSafetyDialog = (type = 'document', openDialog = false) => {
    setSafetyDialogState({ open: true, type, openDialog });
  };

  const handleCloseSafetyDialog = () => {
    setSafetyDialogState({ open: false, type: 'document', openDialog: false });
  };

  const handleCloseSafetyDialogOpenVersionDialog = async () => {
    const type = safetyDialogState.type;
    await setSafetyDialogState({ open: false, type: 'document', openDialog: false });
    handleOpenVersionDialog(type);
  };

  const handleCloseSafetyDialogOpenModal = async () => {
    await setSafetyDialogState({ open: false, type: 'document', openDialog: false });
    handleOpenModal();
  };

  const handleOpenVersionDialog = (type = 'document') => {
    setVersionDialogState({ open: true, type });
  };

  const handleCloseVersionDialog = () => {
    setVersionDialogState({ open: false, type: 'document' });
  };

  const handleCloseVersionDialogOpenModal = async () => {
    await setVersionDialogState({ open: false, type: 'document' });
    handleOpenModal();
  };

  const handleOpenModal = () => {
    setFormModalState({ open: true });
  };

  const handleCloseModal = () => {
    setFormModalState({ open: false });
    formModalFormik.resetForm();
  };

  const handleOpenFormSubscribe = (document) => {
    setFormSubscribeState({ open: true, document });
  };

  const handleCloseFormSubscribe = () => {
    setFormSubscribeState({ open: false, document: null });
    formSubscribeFormik.resetForm();
  };

  // formik
  const formModalFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      consent: false
    },
    validationSchema: yup.object({
      firstName: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.firstName', '')),
      lastName: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.lastName', '')),
      phone: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.phone', '')),
      email: yup
        .string()
        .required(translationHelper.get('common.requestPrintedForm.validations.email', ''))
        .email(translationHelper.get('common.requestPrintedForm.validations.invalidEmail', '')),
      street: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.street', '')),
      city: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.city', '')),
      state: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.state', '')),
      country: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.country', '')),
      postalCode: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.postalCode', '')),
      consent: yup.bool().oneOf([true], translationHelper.get('common.requestPrintedForm.validations.consent', ''))
    }),
    onSubmit: async (values) => {
      const params = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        email: values.email,
        street: values.street,
        city: values.city,
        state: values.state,
        country: values.country,
        postalCode: values.postalCode,
        documentName: document.documentName,
        documentRevision: document.revision,
        documentNumber: document.documentNumber,
        documentLanguage: document.language ? document.language.join(',') : 'No language',
        documentGtin: document.gtins ? document.gtins.join(',') : 'No GTIN',
        documentPublishedDate: document.publishedAt,
        documentUrl: document.file
      };
      const headers = { 'Accept-Language': locale };

      try {
        const requestPrintedVersionResult = await requestPrintedVersion(params, headers);
        if (requestPrintedVersionResult) {
          // show success alert
          setFormModalAlertState({
            ...formModalAlertState,
            open: true,
            type: 'success',
            message: translationHelper.get('common.requestPrintedForm.messages.success', '')
          });
          // reset form
          formModalFormik.resetForm();
          // close modal after 3 seconds
          setTimeout(() => {
            handleCloseModal();
            setFormModalAlertState({
              ...formModalAlertState,
              open: false
            });
          }, 3000);
        } else {
          // show error alert
          setFormModalAlertState({
            ...formModalAlertState,
            open: true,
            type: 'error',
            message: translationHelper.get('common.requestPrintedForm.messages.error', '')
          });
        }
      } catch (error) {
        // console.error(error);
        // show error alert
        setFormModalAlertState({
          ...formModalAlertState,
          open: true,
          type: 'error',
          message: translationHelper.get('common.requestPrintedForm.messages.error', '')
        });
      }
    }
  });

  const formSubscribeFormik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      profession: '',
      organization: '',
      consent: false
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .required(translationHelper.get('common.subscribeForm.validations.email', ''))
        .email(translationHelper.get('common.subscribeForm.validations.invalidEmail', '')),
      consent: yup.bool().oneOf([true], translationHelper.get('common.subscribeForm.validations.consent', ''))
    }),
    onSubmit: async (values) => {
      const { documentNumber } = formSubscribeState.document;

      const params = {
        configId: config.ident,
        documentNumber,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        profession: values.profession,
        organization: values.organization
      };
      const headers = { 'Accept-Language': locale };

      try {
        const requestSubscriptionResult = await requestSubscription(params, headers);
        if (!requestSubscriptionResult || !requestSubscriptionResult.valid) {
          // show error alert
          setFormSubscribeAlertState((prevState) => ({
            ...prevState,
            open: true,
            type: 'error',
            message: translationHelper.get('common.subscribeForm.messages.error', '')
          }));
          return;
        }

        // show success alert
        setFormSubscribeAlertState((prevState) => ({
          ...prevState,
          open: true,
          type: 'success',
          message: translationHelper.get('common.subscribeForm.messages.success', '')
        }));
        // reset form
        formSubscribeFormik.resetForm();
        // close modal after 3 seconds
        setTimeout(() => {
          handleCloseFormSubscribe();
          setFormSubscribeAlertState((prevState) => ({ ...prevState, open: false }));
        }, 3000);
      } catch (error) {
        // console.error(error);
        // show error alert
        setFormSubscribeAlertState((prevState) => ({
          ...prevState,
          open: true,
          type: 'error',
          message: translationHelper.get('common.subscribeForm.messages.error', '')
        }));
      }
    }
  });

  if (isLoadingDocument) {
    return <SoomLoader type="linear" color="primary"></SoomLoader>;
  }

  if (!isLoadingDocument && !document) {
    return <Error404 />;
  }

  // display codes separated by comma
  const identifierDocumentLabel = [];
  let gtinLabel = translationHelper.get('common.documentDetail.noDataLabels.NoGTINs', '');
  let cfnLabel = translationHelper.get('common.documentDetail.noDataLabels.NoProductCodes', '');
  if (document.gtins && Array.isArray(document.gtins) && document.gtins.length > 0) {
    gtinLabel = document.gtins.join(', ');
    identifierDocumentLabel.concat(document.gtins);
  }
  if (document.cfn && Array.isArray(document.cfn) && document.cfn.length > 0) {
    cfnLabel = document.cfn.join(', ');
    identifierDocumentLabel.concat(document.cfn);
  }

  const docSchema: DigitalDocument = {
    '@type': 'DigitalDocument',
    about: `${getDocumentTypeLabel(document.type)} document with number ${document.documentNumber}`,
    audience: document.audience,
    dateCreated: document.createdAt,
    dateModified: document.updatedAt,
    datePublished: document.publishedAt,
    inLanguage: document.language ? document.language.join(',') : '',
    version: document.revision,
    alternateName: document.brandName,
    description: document.description,
    identifier: identifierDocumentLabel.join(','),
    name: document.documentName,
    sameAs: window.document.URL,
    url: document.file
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ '@context': 'https://schema.org', ...docSchema })
          }}
        />
      </Head>
      <Box sx={{ width: '100%', padding: 3, marginBottom: 4 }}>
        <Grid container spacing={3} columns={12}>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid container spacing={3} columns={12}>
                <Grid item xs={8}>
                  <Stack direction="row" spacing={2}>
                    <Link legacyBehavior key={locale} href="/" locale={locale}>
                      <Avatar
                        alt={company.SEOTitle ? company.SEOTitle : 'Web App Site'}
                        src={company.logo && company.logo !== '' ? company.logo : defaultLogo}
                        sx={{ height: '100px', width: 'auto' }}
                        style={{ alignSelf: 'center', cursor: 'pointer' }}
                        variant="square"
                      />
                    </Link>
                    <Stack width={'100%'}>
                      <Typography variant="h5" component="h1">
                        {document.brandName
                          ? document.brandName
                          : translationHelper.get('common.documentDetail.noDataLabels.noBrandName', '')}
                      </Typography>

                      <Typography variant="body2" component="h2">
                        {document.description
                          ? document.description
                          : translationHelper.get('common.documentDetail.noDataLabels.noDescription', '')}
                      </Typography>

                      <Grid container direction="row" spacing={3} sx={{ pt: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" component="div">
                            <strong>
                              {translationHelper.get('common.documentDetail.labels.documentPublishedDate', '')}:
                            </strong>{' '}
                            {document.publishedAt ||
                              translationHelper.get('common.documentDetail.noDataLabels.NoPublishedDate', '')}
                          </Typography>
                          <Typography variant="body2" component="div">
                            <strong>{translationHelper.get('common.documentDetail.labels.documentNumber', '')}:</strong>{' '}
                            {document.documentNumber}
                          </Typography>
                          <Typography variant="body2" component="div">
                            <strong>{translationHelper.get('common.documentDetail.labels.documentType', '')}:</strong>{' '}
                            {getDocumentTypeLabel(document.type)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" component="div">
                            <strong>
                              {translationHelper.get('common.documentDetail.labels.documentRevision', '')}:
                            </strong>{' '}
                            {document.revision}
                          </Typography>
                          <Typography variant="body2" component="div">
                            <strong>{translationHelper.get('common.documentDetail.labels.documentRegion', '')}:</strong>{' '}
                            {document.region ? document.region.join(', ').toUpperCase() : ''}
                          </Typography>
                          <Typography variant="body2" component="div">
                            <strong>
                              {translationHelper.get('common.documentDetail.labels.documentLanguage', '')}:
                            </strong>{' '}
                            {document.language ? document.language.join(', ') : ''}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={4} textAlign="right">
                  {config.doctorAudience && (
                    <AudienceSelector
                      translationHelper={translationHelper}
                      selectedValue={selectedAudience}
                      open={false}
                    />
                  )}

                  {regions.length > 0 && (
                    <RegionSelector
                      title={translationHelper.get('common.labels.countrySelectTitle', '')}
                      items={company.regions}
                      selectedValue={selectedReg}
                      open={false}
                    />
                  )}
                  <LangSelector
                    title={translationHelper.get('common.labels.languageSelectTitle', '')}
                    redirect={`/detail/${document.id}`}
                    items={company.languages}
                    selectedValue={selectedLang}
                    open={openLangs}
                    onClick={handleClickLangs}
                    onClose={handleCloseLangs}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={3} columns={12}>
                <Grid item xs={12} sx={{ textAlign: 'right' }}>
                  <Fab
                    size="medium"
                    color="primary"
                    variant="extended"
                    onClick={() => {
                      if (document.safetyUpdate) {
                        handleOpenSafetyDialog('document', !document.latest_revision);
                      } else if (!document.latest_revision) {
                        handleOpenVersionDialog('document');
                      } else {
                        window.open(document.file, '_blank', 'noreferrer');
                      }
                    }}
                    sx={{ zIndex: 99, ml: 2 }}
                  >
                    <PageviewIcon sx={{ mr: 1 }} />
                    {translationHelper.get('common.documentDetail.labels.viewDocumentBtn', '')}
                  </Fab>

                  {features.showPrintedVersion && (
                    <Fab
                      size="medium"
                      color="primary"
                      variant="extended"
                      onClick={() => {
                        if (document.safetyUpdate) {
                          handleOpenSafetyDialog('request', !document.latest_revision);
                        } else if (!document.latest_revision) {
                          handleOpenVersionDialog('request');
                        } else {
                          handleOpenModal();
                        }
                      }}
                      sx={{ zIndex: 99, ml: 2 }}
                    >
                      <PrintIcon sx={{ mr: 1 }} />
                      {translationHelper.get('common.documentDetail.labels.requestPrintVersionBtn', '')}
                    </Fab>
                  )}

                  <Fab
                    size="medium"
                    color="primary"
                    variant="extended"
                    onClick={() => {
                      handleOpenFormSubscribe(document);
                    }}
                    sx={{ zIndex: 99, ml: 2 }}
                  >
                    <NotificationsActiveIcon sx={{ mr: 1 }} />
                    {translationHelper.get('common.documentDetail.subscribeText', '')}
                  </Fab>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container spacing={3} columns={12}>
          <Grid item xs={12}>
            <Divider sx={{ mt: 3, mb: 2 }} />
          </Grid>
        </Grid>

        <Grid container spacing={3} columns={12}>
          <Grid item xs={12}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {translationHelper.get('common.documentDetail.labels.documentDefinition', '')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 4 }}>
              {document.definition
                ? document.definition
                : translationHelper.get('common.documentDetail.noDataLabels.noDefinition', '')}
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mt: '15px' }}>
              {translationHelper.get('common.documentDetail.labels.documentManufacturer', '')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 4 }}>
              {document.manufacturer}
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mt: '15px' }}>
              {translationHelper.get('common.documentDetail.labels.documentGtins', '')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, maxHeight: '100px', overflowY: 'auto' }}>
              {gtinLabel}
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mt: '15px' }}>
              {translationHelper.get('common.documentDetail.labels.documentCfns', '')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, maxHeight: '100px', overflowY: 'auto' }}>
              {cfnLabel}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {features.showPrintedVersion && (
        <FormModal
          translation={translationHelper.get('common.requestPrintedForm', {})}
          formModalState={formModalState}
          formModalAlertState={formModalAlertState}
          formik={formModalFormik}
          document={document}
          handleCloseModal={handleCloseModal}
        />
      )}

      <FormSubscribeModal
        translation={translationHelper.get('common.subscribeForm', {})}
        formSubscribeState={formSubscribeState}
        formSubscribeAlertState={formSubscribeAlertState}
        formik={formSubscribeFormik}
        handleCloseModal={handleCloseFormSubscribe}
      />

      <Dialog
        fullWidth
        open={safetyDialogState.open}
        onClose={handleCloseSafetyDialog}
        aria-labelledby="safety-update-dialog-title"
        aria-describedby="safety-update-dialog-description"
      >
        <DialogTitle id="safety-update-dialog-title" style={{ padding: '15px' }}>
          <WarningAmberRoundedIcon sx={{ mb: '-4px' }} />{' '}
          {translationHelper.get('common.documentDetail.safetyUpdate.title', '')}
        </DialogTitle>
        <Divider />
        <DialogContent style={{ padding: '15px' }}>
          <DialogContentText id="safety-update-dialog-description">
            {translationHelper.get('common.documentDetail.safetyUpdate.message', '')}
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: '15px' }}>
          <div className={styles.buttons__container} style={{ margin: '0' }}>
            <Button variant="outlined" onClick={handleCloseSafetyDialog}>
              {translationHelper.get('common.documentDetail.safetyUpdate.closeBtn', '')}
            </Button>{' '}
            <Button
              variant="contained"
              onClick={() => {
                if (safetyDialogState.openDialog) {
                  handleCloseSafetyDialogOpenVersionDialog();
                } else if (safetyDialogState.type === 'request') {
                  handleCloseSafetyDialogOpenModal();
                } else {
                  window.open(document.file, '_blank', 'noreferrer');
                  setTimeout(() => {
                    handleCloseSafetyDialog();
                  }, 1000);
                }
              }}
            >
              {translationHelper.get('common.documentDetail.safetyUpdate.continueBtn', '')}
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        open={versionDialogState.open}
        onClose={handleCloseVersionDialog}
        aria-labelledby="safety-update-dialog-title"
        aria-describedby="safety-update-dialog-description"
      >
        <DialogTitle id="safety-update-dialog-title" style={{ padding: '15px' }}>
          <WarningAmberRoundedIcon sx={{ mb: '-4px' }} />{' '}
          {translationHelper.get('common.documentDetail.oldVersion.title', '')}
        </DialogTitle>
        <Divider />
        <DialogContent style={{ padding: '15px' }}>
          <DialogContentText id="safety-update-dialog-description">
            {translationHelper.get('common.documentDetail.oldVersion.message', '')}
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: '15px' }}>
          <div className={styles.buttons__container} style={{ margin: '0' }}>
            <Button variant="outlined" onClick={handleCloseVersionDialog}>
              {translationHelper.get('common.documentDetail.oldVersion.noBtn', '')}
            </Button>{' '}
            <Button
              variant="contained"
              onClick={() => {
                if (versionDialogState.type === 'request') {
                  handleCloseVersionDialogOpenModal();
                } else {
                  window.open(document.file, '_blank', 'noreferrer');
                  setTimeout(() => {
                    handleCloseVersionDialog();
                  }, 1000);
                }
              }}
            >
              {translationHelper.get('common.documentDetail.oldVersion.yesBtn', '')}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
}

// This gets called on every request
export const getServerSideProps = async (context) => {
  const clientConfig = await clientConfigLoader(context);
  const translation = await getPageTranslation('detail', context.locale);
  const regionCookie = getCookie('region', { req: context.req, res: context.res }) || null;
  const audienceCookie = getCookie('audience', { req: context.req, res: context.res }) || null;

  // welcome text
  delete clientConfig.welcomeText;

  // Pass data to the page via props
  return { props: { ...clientConfig, translation, regionCookie, audienceCookie } };
};

export default Detail;
