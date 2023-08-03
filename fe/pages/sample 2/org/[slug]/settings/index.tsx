/* eslint-disable dot-notation */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { get as _get, union as _union, filter as _filter, isEmpty as _isEmpty } from 'lodash';
import SwipeableViews from 'react-swipeable-views';

// next.js stuff
import { useRouter } from 'next/router';
import getConfig from 'next/config';

// material ui stuff
import {
  Box,
  Grid,
  Stack,
  Divider,
  Typography,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import { Settings as SettingsIcon, Close as CloseIcon } from '@mui/icons-material';

// soom-ui
import { SoomButton, SoomCard, SoomAlert, SoomTypography, SoomTextField, SoomSelect } from '@soom-universe/soom-ui';
import { countries as regionsList } from '@soom-universe/soom-utils/constants';

// requests
import {
  requestGetProfileByEmailOrg,
  requestGetSettings,
  requestSaveSettings,
  requestGetBusinessUnits,
  requestCreateBusinessUnit,
  requestEditBusinessUnit,
  requestDeleteBusinessUnit,
  requestGetExternalSites,
  requestCreateExternalSite,
  requestEditExternalSite,
  requestDeleteExternalSite
} from '../../../../helpers/request';
import { hasAccess } from '../../../../helpers/PermissionValidator';

// steps, page wrapper
import PageWrapper from '../../../../wrappers/pageWrapper';

// formik and yup
import * as yup from 'yup';
import { useFormik } from 'formik';

// styling
import styles from './index.module.scss';

// tabs
import Information from '../../../../components/org/settings/steps/Information';
import BusinessUnits from '../../../../components/org/settings/steps/BusinessUnits';
import ExternalSites from '../../../../components/org/settings/steps/ExternalSites';

// get public runtime settings
const {
  publicRuntimeConfig: { appName }
} = getConfig();

export default withPageAuthRequired(function Index({ user }) {
  // hooks
  const router = useRouter();

  const [orgSlug, setOrgSlug] = useState<string>(undefined);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(undefined);
  const [pageAccess, setPageAccess] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [config, setConfig] = useState(undefined);
  const [loadingBUData, setLoadingBUData] = useState(true);
  const [BUData, setBUData] = useState([]);
  const [loadingESData, setLoadingESData] = useState(true);
  const [ESData, setESData] = useState([]);

  const [showAlert, setShowAlert] = useState(false);
  const [errorAlertState, setErrorAlertState] = useState({ open: false, message: '' });
  const [canEdit, setCanEdit] = useState(false);

  const [activeStep, setActiveStep] = useState(0);

  const [formBUState, setFormBUState] = useState({ open: false, loading: false, id: null, name: null });
  const [deleteBUState, setDeleteBUState] = useState({ open: false, loading: false, id: null, name: null });
  const [showFormBUAlert, setShowFormBUAlert] = useState(false);
  const [errorFormBUAlertState, setErrorFormBUAlertState] = useState({ open: false, message: '' });

  const [formESState, setFormESState] = useState({
    open: false,
    loading: false,
    externalSite: null,
    regionsOptions: []
  });
  const [deleteESState, setDeleteESState] = useState({ open: false, loading: false, id: null, url: null });
  const [showFormESAlert, setShowFormESAlert] = useState(false);
  const [errorFormESAlertState, setErrorFormESAlertState] = useState({ open: false, message: '' });

  const [langLimit, setLangLimit] = useState(-1);
  const [multipleDashboardsEnabled, setMultipleDashboardsEnabled] = useState(false);
  const [audienceSelectorEnabled, setAudienceSelectorEnabled] = useState(false);

  // dialog
  const [confirmState, setConfirmState] = useState({ open: false, manufacturer: '' });

  useEffect(() => {
    if (!router.isReady) return;
    const orgParam = router.query.slug as string;
    setOrgSlug(orgParam);
  }, [router.isReady]);

  useEffect(() => {
    if (!orgSlug) return;
    // load profile
    const fetchProfileData = async () => {
      const profileData = await requestGetProfileByEmailOrg(appName, orgSlug);
      const pageAccess = hasAccess('settings', profileData);
      const boundaries = _get(profileData, 'organizationProfiles.0.license.licenseBoundaries', {});
      if (boundaries['languages']) {
        setLangLimit(boundaries['languages'].limit);
      }
      if (boundaries['multiple-dashboards']) {
        setMultipleDashboardsEnabled(boundaries['multiple-dashboards'].enabled);
      }
      if (boundaries['audience-selector']) {
        setAudienceSelectorEnabled(boundaries['audience-selector'].enabled);
      }
      setProfile(profileData);
      setPageAccess(pageAccess);
      setLoadingProfile(false);
    };

    fetchProfileData();
  }, [orgSlug]);

  useEffect(() => {
    if (!profile || !pageAccess) return;
    fetchConfigData();
    fetchBUData();
    fetchESData();
  }, [profile, pageAccess]);

  const fetchConfigData = async () => {
    const configData = await requestGetSettings(appName, orgSlug);
    setCanEdit(!(configData.manufacturer && configData.manufacturer !== ''));
    setConfig(configData);
    setLoadingConfig(false);
  };

  const fetchBUData = async () => {
    // get data from db
    setLoadingBUData(true);
    const businessUnitList = await requestGetBusinessUnits(appName, orgSlug);
    setBUData(businessUnitList || []);
    setLoadingBUData(false);
  };

  const fetchESData = async () => {
    // get data from db
    setLoadingESData(true);
    const externalSiteList = await requestGetExternalSites(appName, orgSlug);
    setESData(externalSiteList || []);
    setLoadingESData(false);
  };

  const fetchESDataRegions = (keepSelectedRegions = []) => {
    // regions available
    const availableRegions = formik.values.regions;

    // regions selected
    let regionsSelected = [];
    ESData.forEach((es) => {
      regionsSelected = _union(regionsSelected, es.regions.split(','));
    });

    // filter new options
    const options = _filter(regionsList, (r) => {
      // if is not in available regions delete it
      if (!availableRegions.includes(r.value)) {
        return false;
      }
      // if is in available regions keep it
      if (keepSelectedRegions.includes(r.value)) {
        return true;
      }
      // if is in regions selected regions delete it
      if (regionsSelected.includes(r.value)) {
        return false;
      }

      return true;
    });

    return options;
  };

  const handleCancel = () => {
    router.push(`/org/${orgSlug}`);
  };

  const handleOpenConfirm = (manufacturer) => {
    setConfirmState({ open: true, manufacturer });
  };

  const handleCloseConfirm = () => {
    setConfirmState({ open: false, manufacturer: '' });
  };

  const handleDeleteBUClickOpen = (id, name) => {
    setDeleteBUState((prevState) => ({ ...prevState, open: true, id, name }));
  };

  const handleDeleteBUClose = () => {
    setDeleteBUState({ open: false, loading: false, id: null, name: null });
  };

  const handleDeleteBU = async () => {
    setDeleteBUState((prevState) => ({ ...prevState, loading: true }));
    await requestDeleteBusinessUnit(appName, orgSlug, deleteBUState.id);
    handleDeleteBUClose();
    fetchBUData();
  };

  const handleBUFormClickOpen = (id = null, name = null) => {
    if (id) {
      formikBU.setFieldValue('name', name);
    } else {
      formikBU.setFieldValue('name', '');
    }
    setFormBUState((prevState) => ({ ...prevState, open: true, id, name }));
  };

  const handleBUFormClose = () => {
    setFormBUState({ open: false, loading: false, id: null, name: null });
    setShowFormBUAlert(false);
    setErrorFormBUAlertState({ open: false, message: '' });
    formikBU.resetForm();
  };

  const handleDeleteESClickOpen = (id, url) => {
    setDeleteESState((prevState) => ({ ...prevState, open: true, id, url }));
  };

  const handleDeleteESClose = () => {
    setDeleteESState({ open: false, loading: false, id: null, url: null });
  };

  const handleDeleteES = async () => {
    setDeleteESState((prevState) => ({ ...prevState, loading: true }));
    await requestDeleteExternalSite(appName, orgSlug, deleteESState.id);
    handleDeleteESClose();
    fetchESData();
  };

  const handleESFormClickOpen = (externalSite = null) => {
    let regionsOptions;

    if (externalSite) {
      regionsOptions = fetchESDataRegions(externalSite.regions.split(','));
      formikES.setFieldValue('regions', externalSite.regions.split(','));
      formikES.setFieldValue('url', externalSite.url);
    } else {
      regionsOptions = fetchESDataRegions();
      formikES.setFieldValue('regions', []);
      formikES.setFieldValue('url', '');
    }

    setFormESState((prevState) => ({ ...prevState, open: true, externalSite, regionsOptions }));
  };

  const handleESFormClose = () => {
    setFormESState({ open: false, loading: false, externalSite: null, regionsOptions: [] });
    setShowFormESAlert(false);
    setErrorFormESAlertState({ open: false, message: '' });
    formikES.resetForm();
  };

  const handleStep = (event, newValue) => {
    setActiveStep(newValue);
  };

  const handleStepView = (newValue) => {
    setActiveStep(newValue);
  };

  const getManufacturerAlias = _get(config, 'manufacturer_alias', null);
  const getRegions = _get(config, 'regions', null);
  const getLanguages = _get(config, 'languages', null);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      manufacturer: _get(config, 'manufacturer', '') || '',
      manufacturerAlias: getManufacturerAlias ? getManufacturerAlias.split(',') : [],
      notificationsEmail: _get(config, 'notifications_email', '') || '',
      phoneNumber: _get(config, 'phone_number', '') || '',
      regions: getRegions ? getRegions.split(',') : [],
      languages: getLanguages ? getLanguages.split(',') : [process.env.DEFAULT_LANGUAGE],
      webapp_password_preview: _get(config, 'webapp_password_preview', '') || '',
      webapp_password_production: _get(config, 'webapp_password_production', '') || '',
      doctor_audience: audienceSelectorEnabled ? _get(config, 'doctor_audience', false) : false
    },
    validationSchema: yup.object({
      manufacturer: yup.string().required('Manufacturer is required'),
      manufacturerAlias: yup
        .array()
        .min(1, 'At least one alias is required. Type in an alias and press Enter to add it.'),
      notificationsEmail: yup.string().required('Email is required').email('Invalid email'),
      phoneNumber: yup.string().required('Phone Number is required'),
      languages:
        langLimit >= 0
          ? yup
              .array()
              .min(1, 'At least one option is required')
              .max(langLimit, `The limit of options that can be selected are ${langLimit}`)
          : yup.array().min(1, 'At least one option is required'),
      regions: yup.array(),
      webapp_password_preview: yup.string(),
      webapp_password_production: yup.string()
    }),
    onSubmit: async (values) => {
      try {
        setShowAlert(false);
        setErrorAlertState({ open: false, message: '' });

        const data = {
          org: orgSlug,
          app: appName,
          manufacturer: canEdit ? _get(values, 'manufacturer', '') : undefined,
          manufacturer_alias: _get(values, 'manufacturerAlias', '').join(','),
          notifications_email: _get(values, 'notificationsEmail', ''),
          phone_number: _get(values, 'phoneNumber', ''),
          regions: _get(values, 'regions', []).join(','),
          languages: _get(values, 'languages', [process.env.DEFAULT_LANGUAGE]).join(','),
          webapp_password_preview: _get(values, 'webapp_password_preview', ''),
          webapp_password_production: _get(values, 'webapp_password_production', ''),
          doctor_audience: _get(values, 'doctor_audience', false)
        };

        const result = await requestSaveSettings(data);
        if (result.error) {
          setErrorAlertState({ open: true, message: result.data.error });
          return;
        }

        setConfig(result);
        setCanEdit(false);
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
      } catch (error) {
        // console.error(error);
        setErrorAlertState({ open: true, message: 'There was an error processing your request!' });
      }
    }
  });

  const formikBU = useFormik({
    enableReinitialize: true,
    initialValues: { name: '' },
    validationSchema: yup.object({
      name: yup.string().required('Name is required')
    }),
    onSubmit: async (values) => {
      try {
        setShowFormBUAlert(false);
        setErrorFormBUAlertState({ open: false, message: '' });
        setFormBUState((prevState) => ({ ...prevState, loading: true }));

        let result;
        if (formBUState.id) {
          result = await requestEditBusinessUnit(appName, orgSlug, formBUState.id, values.name);
        } else {
          result = await requestCreateBusinessUnit(appName, orgSlug, values.name);
        }
        if (!result.valid) {
          setErrorFormBUAlertState({ open: true, message: result.message });
          return;
        }

        setShowFormBUAlert(true);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        handleBUFormClose();
        setShowFormBUAlert(false);
        fetchBUData();
      } catch (error) {
        // console.error(error);
        setErrorFormBUAlertState({ open: true, message: 'There was an error processing your request!' });
      }
    }
  });

  const formikES = useFormik({
    enableReinitialize: true,
    initialValues: {
      regions: [],
      url: ''
    },
    validationSchema: yup.object({
      regions: yup.array().min(1, 'At least one option is required'),
      url: yup
        .string()
        .matches(
          /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
          'Enter a correct URL (http(s)://example.com)'
        )
        .required('URL is required')
    }),
    onSubmit: async (values) => {
      try {
        setShowFormESAlert(false);
        setErrorFormESAlertState({ open: false, message: '' });
        setFormESState((prevState) => ({ ...prevState, loading: true }));

        let result;
        if (formESState.externalSite) {
          result = await requestEditExternalSite(
            appName,
            orgSlug,
            formESState.externalSite.external_site_id,
            values.regions.join(','),
            values.url
          );
        } else {
          result = await requestCreateExternalSite(appName, orgSlug, values.regions.join(','), values.url);
        }
        if (!result.valid) {
          setErrorFormESAlertState({ open: true, message: result.message });
          return;
        }

        setShowFormESAlert(true);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        handleESFormClose();
        setShowFormESAlert(false);
        fetchESData();
      } catch (error) {
        // console.error(error);
        setErrorFormESAlertState({ open: true, message: 'There was an error processing your request!' });
      }
    }
  });

  // tabs
  const tabs = [Information, ExternalSites];
  if (multipleDashboardsEnabled) {
    tabs.push(BusinessUnits);
  }

  return (
    <PageWrapper
      org={orgSlug}
      profile={profile}
      loading={loadingProfile || (pageAccess && loadingConfig)}
      pageAccess={pageAccess}
    >
      <Box className={styles.form__container}>
        <SoomCard dataTestId="prueba" ariaLabel="prueba">
          <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
            <Typography variant="h6" component="div">
              <SettingsIcon sx={{ verticalAlign: 'middle' }} /> Settings
            </Typography>
          </Stack>
          <Divider className={styles.divider__header} />
          <form noValidate className={styles.form} onSubmit={formik.handleSubmit}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeStep} onChange={handleStep} variant="fullWidth">
                {tabs.map((TabContent, tabIndex) => {
                  return <Tab label={TabContent.label} key={`tab${tabIndex}`} />;
                })}
              </Tabs>
            </Box>

            <SwipeableViews index={activeStep} onChangeIndex={handleStepView}>
              {tabs.map((TabContent, tabIndex) => {
                return (
                  <TabContent
                    key={`tabContent${tabIndex}`}
                    formik={formik}
                    canEdit={canEdit}
                    loadingBUData={loadingBUData}
                    BUData={BUData}
                    handleDeleteBUClickOpen={handleDeleteBUClickOpen}
                    handleBUFormClickOpen={handleBUFormClickOpen}
                    formBULoading={formikBU.isSubmitting}
                    loadingESData={loadingESData}
                    ESData={ESData}
                    handleDeleteESClickOpen={handleDeleteESClickOpen}
                    handleESFormClickOpen={handleESFormClickOpen}
                    formESLoading={formikES.isSubmitting}
                    audienceSelectorEnabled={audienceSelectorEnabled}
                  />
                );
              })}
            </SwipeableViews>

            <Divider className={styles.divider__buttons} />

            {showAlert && (
              <SoomAlert dataTestId="AlertDiv" ariaLabel="AlertDiv" severity="success">
                <SoomTypography
                  dataTestId="alertMessage"
                  ariaLabel="alertMessage"
                  text="Settings saved successfully"
                  variant="body1"
                  component="span"
                />
              </SoomAlert>
            )}

            {errorAlertState.open && (
              <SoomAlert dataTestId="ErrorAlertDiv" ariaLabel="ErrorAlertDiv" severity="error">
                <SoomTypography
                  dataTestId="errorMessage"
                  ariaLabel="errorMessage"
                  text={errorAlertState.message}
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
                dataTestId="btnSave"
                ariaLabel="Save"
                type="submit"
                variant="contained"
                handlerOnClick={async (e) => {
                  e.preventDefault();
                  if (canEdit) {
                    const errors = await formik.validateForm();
                    const hasErrors = !_isEmpty(errors);
                    if (hasErrors) {
                      const touchedInputs = {};
                      for (const [input] of Object.entries(errors)) {
                        touchedInputs[input] = true;
                      }
                      await formik.setTouched(touchedInputs);
                      formik.setErrors(errors);
                    } else {
                      handleOpenConfirm(formik.values.manufacturer);
                    }
                  } else {
                    formik.handleSubmit();
                  }
                }}
                label="Save"
                loading={formik.isSubmitting}
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
      >
        <DialogTitle id="confirm-dialog-title" style={{ padding: '15px' }}>
          Confirm the value set for Manufacturer
        </DialogTitle>
        <Divider />

        <DialogContent style={{ padding: '15px' }}>
          <DialogContentText id="confirm-dialog-description">
            Manufacturer value can&apos;t be changed anymore. This value and Manufacturer aliases must match what you
            have in the GUDID. Are you sure you want to set <strong>&quot;{confirmState.manufacturer}&quot;</strong> as
            Manufacturer?
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

      {/* business unit */}
      <Dialog
        open={deleteBUState.open}
        onClose={handleDeleteBUClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{'Are you sure you want to delete this business unit?'}</DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            You are trying to delete <strong>{deleteBUState.name}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <SoomButton
            dataTestId="btnNo"
            ariaLabel="btnNo"
            variant="text"
            handlerOnClick={handleDeleteBUClose}
            label="Cancel"
            type="button"
            disabled={deleteBUState.loading}
          />
          <SoomButton
            dataTestId="btnYes"
            ariaLabel="btnYes"
            variant="text"
            handlerOnClick={handleDeleteBU}
            label="Continue"
            type="button"
            loading={deleteBUState.loading}
          />
        </DialogActions>
      </Dialog>

      <Modal open={formBUState.open} onClose={handleBUFormClose} aria-labelledby="create-modal-title">
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
              {formBUState.id ? 'Edit Business Unit' : 'New Business Unit'}
            </Typography>
            <IconButton onClick={handleBUFormClose} sx={{ float: 'right' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item md={12} xs={12}>
                <form onSubmit={formikBU.handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item md={12} xs={12}>
                      <SoomTextField
                        fullWidth
                        dataTestId="name"
                        ariaLabel="NameLabel"
                        id="name"
                        name="name"
                        variant="outlined"
                        label="Name"
                        placeholder="Enter a name"
                        required={true}
                        value={formikBU.values.name}
                        handlerOnChange={formikBU.handleChange}
                        error={formikBU.touched.name && Boolean(formikBU.errors.name)}
                        helperText={
                          formikBU.touched.name && formikBU.errors.name ? String(formikBU.errors.name) : undefined
                        }
                      />
                    </Grid>
                  </Grid>
                  <Divider style={{ margin: '10px 0' }} />

                  {showFormBUAlert && (
                    <SoomAlert dataTestId="AlertDiv" ariaLabel="AlertDiv" severity="success">
                      <SoomTypography
                        dataTestId="alertMessage"
                        ariaLabel="alertMessage"
                        text="Business unit saved successfully"
                        variant="body1"
                        component="span"
                      />
                    </SoomAlert>
                  )}

                  {errorFormBUAlertState.open && (
                    <SoomAlert dataTestId="ErrorAlertDiv" ariaLabel="ErrorAlertDiv" severity="error">
                      <SoomTypography
                        dataTestId="errorMessage"
                        ariaLabel="errorMessage"
                        text={errorFormBUAlertState.message}
                        variant="body1"
                        component="span"
                      />
                    </SoomAlert>
                  )}

                  <div className={styles.buttons__container} style={{ marginTop: '15px', marginBottom: '0' }}>
                    <SoomButton
                      dataTestId="btnCancel"
                      ariaLabel="CancelLabel"
                      variant="outlined"
                      handlerOnClick={handleBUFormClose}
                      label="Cancel"
                      type="button"
                      disabled={formikBU.isSubmitting}
                    />{' '}
                    <SoomButton
                      dataTestId="btnSubmit"
                      ariaLabel="SaveLabel"
                      variant="contained"
                      handlerOnClick={formikBU.handleSubmit}
                      label="Save"
                      type="submit"
                      loading={formikBU.isSubmitting}
                    />
                  </div>
                </form>
              </Grid>
            </Grid>
          </DialogContent>
        </Box>
      </Modal>

      {/* external sites */}
      <Dialog
        open={deleteESState.open}
        onClose={handleDeleteESClose}
        aria-labelledby="delete-es-dialog-title"
        aria-describedby="delete-es-dialog-description"
      >
        <DialogTitle id="delete-es-dialog-title">{'Are you sure you want to delete this redirect?'}</DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            You are trying to delete <strong>{deleteESState.url}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <SoomButton
            dataTestId="btnNo"
            ariaLabel="btnNo"
            variant="text"
            handlerOnClick={handleDeleteESClose}
            label="Cancel"
            type="button"
            disabled={deleteESState.loading}
          />
          <SoomButton
            dataTestId="btnYes"
            ariaLabel="btnYes"
            variant="text"
            handlerOnClick={handleDeleteES}
            label="Continue"
            type="button"
            loading={deleteESState.loading}
          />
        </DialogActions>
      </Dialog>

      <Modal open={formESState.open} onClose={handleESFormClose} aria-labelledby="create-modal-title">
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
              {formESState.externalSite ? 'Edit Redirect' : 'New Redirect'}
            </Typography>
            <IconButton onClick={handleESFormClose} sx={{ float: 'right' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item md={12} xs={12}>
                <form onSubmit={formikES.handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item md={12} xs={12}>
                      <SoomSelect
                        dataTestId="regions"
                        ariaLabel="RegionsLabel"
                        options={formESState.regionsOptions}
                        isMultiple={true}
                        id="regions"
                        name="regions"
                        label="Regions"
                        value={formikES.values.regions}
                        onChange={formikES.handleChange}
                        error={formikES.touched.regions && Boolean(formikES.errors.regions)}
                        textError={
                          formikES.touched.regions && formikES.errors.regions
                            ? String(formikES.errors.regions)
                            : undefined
                        }
                      />
                    </Grid>
                    <Grid item md={12} xs={12}>
                      <SoomTextField
                        fullWidth
                        dataTestId="url"
                        ariaLabel="URLLabel"
                        id="url"
                        name="url"
                        variant="outlined"
                        label="URL"
                        placeholder="Enter a URL"
                        required={true}
                        value={formikES.values.url}
                        handlerOnChange={formikES.handleChange}
                        error={formikES.touched.url && Boolean(formikES.errors.url)}
                        helperText={
                          formikES.touched.url && formikES.errors.url ? String(formikES.errors.url) : undefined
                        }
                      />
                    </Grid>
                  </Grid>
                  <Divider style={{ margin: '10px 0' }} />

                  {showFormESAlert && (
                    <SoomAlert dataTestId="AlertDiv" ariaLabel="AlertDiv" severity="success">
                      <SoomTypography
                        dataTestId="alertMessage"
                        ariaLabel="alertMessage"
                        text="Redirect saved successfully"
                        variant="body1"
                        component="span"
                      />
                    </SoomAlert>
                  )}

                  {errorFormESAlertState.open && (
                    <SoomAlert dataTestId="ErrorAlertDiv" ariaLabel="ErrorAlertDiv" severity="error">
                      <SoomTypography
                        dataTestId="errorMessage"
                        ariaLabel="errorMessage"
                        text={errorFormESAlertState.message}
                        variant="body1"
                        component="span"
                      />
                    </SoomAlert>
                  )}

                  <div className={styles.buttons__container} style={{ marginTop: '15px', marginBottom: '0' }}>
                    <SoomButton
                      dataTestId="btnCancel"
                      ariaLabel="CancelLabel"
                      variant="outlined"
                      handlerOnClick={handleESFormClose}
                      label="Cancel"
                      type="button"
                      disabled={formikES.isSubmitting}
                    />{' '}
                    <SoomButton
                      dataTestId="btnSubmit"
                      ariaLabel="SaveLabel"
                      variant="contained"
                      handlerOnClick={formikES.handleSubmit}
                      label="Save"
                      type="submit"
                      loading={formikES.isSubmitting}
                    />
                  </div>
                </form>
              </Grid>
            </Grid>
          </DialogContent>
        </Box>
      </Modal>
    </PageWrapper>
  );
});
