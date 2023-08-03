/* eslint-disable react-hooks/exhaustive-deps */
// styling
import styles from './index.module.scss';

// auth & react stuff
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import React, { useEffect, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { get as _get } from 'lodash';

// next.js stuff
import { useRouter } from 'next/router';
import getConfig from 'next/config';

// material ui stuff
import { AlertTitle, Box, Stack, Divider, Stepper, Step, StepLabel, Typography } from '@mui/material';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';

// soom-ui
import { SoomButton, SoomCard, SoomAlert, SoomTypography } from '@soom-universe/soom-ui';

// helpers
import {
  requestGetProfileByEmailOrg,
  requestGetLicenseSettings,
  requestSaveLicenseSettings,
  requestPublishLicenseSettings
} from '../../../../helpers/request';
import { Uploader } from '../../../../helpers/uploader';
import { Permissions, hasPermission, hasAccess } from '../../../../helpers/PermissionValidator';

// vercel
import { getCustomDomainSettings } from '../../../../helpers/vercel';

// steps, page wrapper
import PageWrapper from '../../../../wrappers/pageWrapper';
import Information from '../../../../components/org/webapp-settings/steps/Information';
import WelcomeText from '../../../../components/org/webapp-settings/steps/WelcomeText';
import Images from '../../../../components/org/webapp-settings/steps/Images';
import Branding from '../../../../components/org/webapp-settings/steps/Branding';
import Visualizations from '../../../../components/org/webapp-settings/steps/Visualizations';

// formik and yup
import * as yup from 'yup';
import { useFormik } from 'formik';

// get soom functions
import { getS3Endpoint } from '@soom-universe/soom-utils/functions';

// get public runtime settings
const {
  publicRuntimeConfig: { appName, logoDimensions, iconDimensions }
} = getConfig();

// default dropzone text
const defaultDropzoneTextLogo = 'Drag and drop the logo here or click';
const defaultDropzoneTextIcon = 'Drag and drop the icon here or click';

// steps components and validation schema
const steps = [Information, WelcomeText, Images, Branding, Visualizations];
const welcomeTextStep = 1;
const stepsValidationSchema = [
  yup.object({
    coSEOTitle: yup.string().required('SEO title is required'),
    coSEODescription: yup.string().required('SEO description is required'),
    coCustomDomain: yup.string().test({
      name: 'is-domain',
      message: 'Must be a valid domain or subdomain',
      test: function (value) {
        return (
          yup
            .string()
            // eslint-disable-next-line no-useless-escape
            .matches(/^(?=.{4,255}$)([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*([a-zA-Z]{2,})$/)
            .isValidSync(value)
        );
      }
    }),
    coTermsOfUseUrl: yup
      .string()
      .matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        'Enter a correct URL (http(s)://example.com)'
      )
  }),
  yup.object({}),
  yup.object({}),
  yup.object({
    thPrimaryColor: yup.string().required('Color is required'),
    thPrimaryTextColor: yup.string().required('Color is required'),
    thFooterBackgroundColor: yup.string().required('Color is required'),
    thFooterTextColor: yup.string().required('Color is required'),
    thGdprBackgroundColor: yup.string().required('Color is required'),
    thGdprTextColor: yup.string().required('Color is required'),
    thGdprAcceptBtnColor: yup.string().required('Color is required'),
    thGdprAcceptBtnTextColor: yup.string().required('Color is required'),
    thGdprDeclineBtnColor: yup.string().required('Color is required'),
    thGdprDeclineBtnTextColor: yup.string().required('Color is required')
  }),
  yup.object({})
];

export default withPageAuthRequired(function Index({ user }) {
  // hooks
  const router = useRouter();

  const [orgSlug, setOrgSlug] = useState<string>(undefined);
  const [bucket, setBucket] = useState<string>(undefined);
  const [activeStep, setActiveStep] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(undefined);
  const [pageAccess, setPageAccess] = useState(false);
  const [loadingLicenseConfig, setLoadingLicenseConfig] = useState(true);
  const [licenseConfig, setLicenseConfig] = useState(undefined);
  const [editLicenseConfig, setEditLicenseConfig] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [errorAlertState, setErrorAlertState] = useState({ open: false, message: '' });
  const [isSubmittingPublish, setIsSubmittingPublish] = useState(false);
  const [showAlertPublish, setShowAlertPublish] = useState(false);
  const [errorAlertPublishState, setErrorAlertPublishState] = useState({ open: false, message: '' });
  // logo
  const [uploaderLogo, setUploaderLogo] = useState(undefined);
  const [dropzoneState, setDropzoneState] = useState({
    file: undefined,
    text: defaultDropzoneTextLogo,
    imgSrc: undefined,
    imgWidth: undefined,
    imgHeight: undefined
  });
  const [incorrectLogoDimensions, setIncorrectLogoDimensions] = useState<boolean>(false);
  // icon
  const [uploaderIcon, setUploaderIcon] = useState(undefined);
  const [dropzoneIconState, setDropzoneIconState] = useState({
    file: undefined,
    text: defaultDropzoneTextIcon,
    imgSrc: undefined,
    imgWidth: undefined,
    imgHeight: undefined
  });
  const [incorrectIconDimensions, setIncorrectIconDimensions] = useState<boolean>(false);
  const [oldCustomDomain, setOldCustomDomain] = useState<string>('');
  const [customDomainSettings, setCustomDomainSettings] = useState({
    showDomainInstructions: false,
    showSubDomainInstructions: false,
    subdomain: ''
  });
  const [customDomainEnabled, setCustomDomainEnabled] = useState(false);

  // analytics admin
  const [isAnalyticsAdmin, setIsAnalyticsAdmin] = useState(false);

  // welcome text
  const [languages, setLanguages] = useState([]);
  const [customizeWelcomeText, setCustomizeWelcomeText] = useState(false);

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
      const pageAccess = hasAccess('webAppSettings', profileData);
      const bucketValue = _get(profileData, 'organizationProfiles.0.configuration.bucket', '');
      const languagesValues = _get(profileData, 'organizationProfiles.0.configuration.languages', {});
      const boundaries = _get(profileData, 'organizationProfiles.0.license.licenseBoundaries', {});
      const isAnalyticsAdminValue = hasPermission(Permissions.ANALYTICS_ADMIN, profileData);

      setBucket(bucketValue);
      setLanguages(languagesValues);
      setIsAnalyticsAdmin(isAnalyticsAdminValue);
      setProfile(profileData);
      setPageAccess(pageAccess);
      setOldCustomDomain(_get(profileData, 'domains.custom'));
      setCustomDomainSettings(getCustomDomainSettings(_get(profileData, 'domains.custom')));
      setCustomDomainEnabled(boundaries['custom-domain'] ? boundaries['custom-domain'].enabled : false);

      setLoadingProfile(false);
    };

    fetchProfileData();
  }, [orgSlug]);

  useEffect(() => {
    if (!profile || !pageAccess) return;
    // load license config
    const fetchLicenseConfigData = async () => {
      const licenseConfigData = await requestGetLicenseSettings(appName, orgSlug);
      if (licenseConfigData && licenseConfigData.welcome_text) {
        setCustomizeWelcomeText(Object.keys(licenseConfigData.welcome_text).length > 0);
      }
      setEditLicenseConfig(!licenseConfigData);
      setLicenseConfig(licenseConfigData);
      resetDropzoneLogo(licenseConfigData);
      resetDropzoneIcon(licenseConfigData);
      setLoadingLicenseConfig(false);
    };

    fetchLicenseConfigData();
  }, [profile, pageAccess]);

  const isLastStep = () => {
    return activeStep === steps.length - 1;
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleCancel = () => {
    setEditLicenseConfig(false);
    resetDropzoneLogo(licenseConfig);
    resetDropzoneIcon(licenseConfig);
  };

  const handleEditConfig = () => {
    setActiveStep(0);
    setEditLicenseConfig(true);
  };

  const handlePublishConfig = async () => {
    try {
      setIsSubmittingPublish(true);
      resetAlertsPublishConfig();

      const result = await requestPublishLicenseSettings(appName, orgSlug);
      if (result.error) {
        setIsSubmittingPublish(false);
        setErrorAlertPublishState({ open: true, message: result.data.error });
        resetAlertsPublishConfig(true);
        return;
      }

      setLicenseConfig(result);
      setIsSubmittingPublish(false);
      setShowAlertPublish(true);
      resetAlertsPublishConfig(true);
      return;
    } catch (error) {
      console.error(error);
      setIsSubmittingPublish(false);
      setErrorAlertPublishState({ open: true, message: 'There was an error processing your request!' });
      resetAlertsPublishConfig(true);
    }
  };

  const resetAlertsPublishConfig = (delay?: boolean) => {
    if (delay) {
      setTimeout(() => {
        setShowAlertPublish(false);
        setErrorAlertPublishState({ open: false, message: '' });
      }, 3000);
    } else {
      setShowAlertPublish(false);
      setErrorAlertPublishState({ open: false, message: '' });
    }
  };

  const handleOnChangeDropzoneArea = (files) => {
    const file = files[0];
    formik.setFieldTouched('coLogo', true);
    formik.setFieldValue('coLogo', file, false);
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        // dimensions validation
        const ratioLogo = logoDimensions.w / logoDimensions.h;
        const ratioImg = img.width / img.height;
        if (ratioLogo !== ratioImg) {
          formik.setFieldError(
            'coLogo',
            `Incorrect image dimensions, should have a ${ratioLogo}:1 aspect ratio. Example ${logoDimensions.w} x ${logoDimensions.h} px`
          );
          setIncorrectLogoDimensions(true);
          return false;
        } else {
          setDropzoneState({ ...dropzoneState, file, imgSrc: img.src, imgWidth: img.width, imgHeight: img.height });
          setIncorrectLogoDimensions(false);
          return true;
        }
      };
      img.src = url;
    }
  };

  const handleOnCancelDropzoneArea = () => {
    resetDropzoneLogo(licenseConfig);
    setIncorrectLogoDimensions(false);
    if (uploaderLogo) {
      uploaderLogo.abort();
    }
  };

  const resetDropzoneLogo = (licenseConfigData) => {
    // reset dropzone with loaded values
    if (!licenseConfigData) {
      setDropzoneState({
        file: undefined,
        text: defaultDropzoneTextLogo,
        imgSrc: undefined,
        imgWidth: undefined,
        imgHeight: undefined
      });
    }

    let logo = _get(licenseConfigData, 'settings.company.logo', '');
    if (logo !== '') {
      logo = getS3Endpoint(bucket, logo);
      const img = new Image();
      img.onload = function () {
        setDropzoneState({
          ...dropzoneState,
          file: undefined,
          text: defaultDropzoneTextLogo,
          imgSrc: img.src,
          imgWidth: img.width,
          imgHeight: img.height
        });
      };
      img.src = logo;
    } else {
      setDropzoneState({
        file: undefined,
        text: defaultDropzoneTextLogo,
        imgSrc: undefined,
        imgWidth: undefined,
        imgHeight: undefined
      });
    }
  };

  const handleOnChangeDropzoneAreaIcon = (files) => {
    const file = files[0];
    formik.setFieldTouched('coIcon', true);
    formik.setFieldValue('coIcon', file, false);
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        // dimensions validation
        const ratioIcon = iconDimensions.w / iconDimensions.h;
        const ratioImg = img.width / img.height;
        if (ratioIcon !== ratioImg) {
          formik.setFieldError(
            'coIcon',
            `Incorrect image dimensions, should have a ${ratioIcon}:1 aspect ratio. Example ${iconDimensions.w} x ${iconDimensions.h} px`
          );
          setIncorrectIconDimensions(true);
          return false;
        } else {
          setDropzoneIconState({ ...dropzoneState, file, imgSrc: img.src, imgWidth: img.width, imgHeight: img.height });
          setIncorrectIconDimensions(false);
          return true;
        }
      };
      img.src = url;
    }
  };

  const handleOnCancelDropzoneAreaIcon = () => {
    resetDropzoneIcon(licenseConfig);
    setIncorrectIconDimensions(false);
    if (uploaderIcon) {
      uploaderIcon.abort();
    }
  };

  const resetDropzoneIcon = (licenseConfigData) => {
    // reset dropzone with loaded values
    if (!licenseConfigData) {
      setDropzoneIconState({
        file: undefined,
        text: defaultDropzoneTextIcon,
        imgSrc: undefined,
        imgWidth: undefined,
        imgHeight: undefined
      });
    }

    let icon = _get(licenseConfigData, 'settings.company.icon', '');
    if (icon !== '') {
      icon = getS3Endpoint(bucket, icon);
      const img = new Image();
      img.onload = function () {
        setDropzoneIconState({
          ...dropzoneState,
          file: undefined,
          text: defaultDropzoneTextIcon,
          imgSrc: img.src,
          imgWidth: img.width,
          imgHeight: img.height
        });
      };
      img.src = icon;
    } else {
      setDropzoneIconState({
        file: undefined,
        text: defaultDropzoneTextIcon,
        imgSrc: undefined,
        imgWidth: undefined,
        imgHeight: undefined
      });
    }
  };

  const uploadFile = async (file: object, fileKey: string, instance: string) => {
    const setState = instance === 'icon' ? setDropzoneIconState : setDropzoneState;
    const setUploader = instance === 'icon' ? setUploaderIcon : setUploaderLogo;
    const resetDropzone = instance === 'icon' ? resetDropzoneIcon : resetDropzoneLogo;

    setState({
      ...dropzoneState,
      text: `Uploading 0%`
    });

    const fileUploaderOptions = { bucket, fileName: fileKey, file };

    let percentage;
    const uploaderInstance = new Uploader(fileUploaderOptions);
    setUploader(uploaderInstance);
    uploaderInstance
      .onProgress(({ percentage: newPercentage }) => {
        // to avoid the same percentage to be logged twice
        if (newPercentage !== percentage) {
          percentage = newPercentage;
          setState({
            ...dropzoneState,
            text: `Uploading ${percentage}%`
          });
        }
        if (percentage === 100) {
          setState({
            ...dropzoneState,
            text: `File successfully uploaded!`
          });
        }
      })
      .onError((error) => {
        console.error(error);
        resetDropzone(licenseConfig);
      });

    return uploaderInstance.start();
  };

  // welcome text form
  const langValues = {};
  const langValidations = {};
  if (customizeWelcomeText) {
    languages.forEach((langObj) => {
      const langIndex = `lang_${langObj.value}`;
      langValues[langIndex] = _get(licenseConfig, `welcome_text.${langIndex}`, '');
      langValidations[langIndex] = yup.string().required('Field required');
    });
  }
  stepsValidationSchema[welcomeTextStep] = yup.object({ ...langValidations });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      coSEOTitle: _get(licenseConfig, 'settings.company.SEOTitle', ''),
      coSEODescription: _get(licenseConfig, 'settings.company.SEODescription', ''),
      coCustomDomain: _get(profile, 'domains.custom'),
      coTermsOfUseUrl: _get(licenseConfig, 'settings.company.termsOfUseUrl'),
      coAnalyticsTagId: _get(licenseConfig, 'settings.company.analyticsTagId', ''),
      coAnalyticsAdminTagId: _get(licenseConfig, 'settings.company.analyticsAdminTagId', ''),
      coAnalyticsEmbedCode: _get(licenseConfig, 'settings.company.analyticsEmbedCode', ''),

      ...langValues,

      thFooterBackgroundColor: _get(licenseConfig, 'settings.theme.footerBackgroundColor', '#444444'),
      thFooterTextColor: _get(licenseConfig, 'settings.theme.footerTextColor', '#ffffff'),
      thPrimaryColor: _get(licenseConfig, 'settings.theme.primaryColor', '#1976d2'),
      thPrimaryTextColor: _get(licenseConfig, 'settings.theme.primaryTextColor', '#ffffff'),
      thGdprBackgroundColor: _get(licenseConfig, 'settings.theme.gdprBackgroundColor', '#01579b'),
      thGdprTextColor: _get(licenseConfig, 'settings.theme.gdprTextColor', '#ffffff'),
      thGdprAcceptBtnColor: _get(licenseConfig, 'settings.theme.gdprAcceptBtnColor', '#fbb042'),
      thGdprAcceptBtnTextColor: _get(licenseConfig, 'settings.theme.gdprAcceptBtnTextColor', '#000000'),
      thGdprDeclineBtnColor: _get(licenseConfig, 'settings.theme.gdprDeclineBtnColor', '#e8e8e8'),
      thGdprDeclineBtnTextColor: _get(licenseConfig, 'settings.theme.gdprDeclineBtnTextColor', '#000000'),

      feShowPrintedVersion: _get(licenseConfig, 'settings.features.showPrintedVersion', true),
      feShowRegions: _get(licenseConfig, 'settings.features.showRegions', true),
      feShowLanguages: _get(licenseConfig, 'settings.features.showLanguages', true),
      feShowFlags: _get(licenseConfig, 'settings.features.showFlags', true)
    },
    validationSchema: stepsValidationSchema[activeStep] || yup.object({}),
    onSubmit: async (values) => {
      // just validate step form
      if (!isLastStep()) {
        handleNext();
        return;
      }

      try {
        const makeApiRequest = async (params) => {
          const result = await requestSaveLicenseSettings(params);
          if (result.error) {
            setErrorAlertState({ open: true, message: result.data.error });
            return;
          }
          setOldCustomDomain(data.company.customDomain);
          setCustomDomainSettings(getCustomDomainSettings(data.company.customDomain));

          setShowAlert(true);
          await new Promise((resolve) => {
            setTimeout(() => {
              setShowAlert(false);
              setEditLicenseConfig(false);
              setLicenseConfig(result);
              resetDropzoneLogo(result);
              resetDropzoneIcon(result);
              resolve(true);
            }, 2000);
          });
        };

        setShowAlert(false);
        setErrorAlertState({ open: false, message: '' });

        // lang values
        const langValues = {};
        if (customizeWelcomeText) {
          languages.forEach((langObj) => {
            const langIndex = `lang_${langObj.value}`;
            langValues[langIndex] = values[langIndex];
          });
        }

        const data = {
          org: orgSlug,
          app: appName,
          company: {
            logo: _get(licenseConfig, 'settings.company.logo', ''),
            icon: _get(licenseConfig, 'settings.company.icon', ''),
            SEOTitle: values.coSEOTitle,
            SEODescription: values.coSEODescription,
            customDomain: values.coCustomDomain,
            oldCustomDomain,
            termsOfUseUrl: values.coTermsOfUseUrl,
            analyticsTagId: values.coAnalyticsTagId,
            analyticsAdminTagId: values.coAnalyticsAdminTagId,
            analyticsEmbedCode: values.coAnalyticsEmbedCode
          },
          theme: {
            primaryColor: values.thPrimaryColor,
            primaryTextColor: values.thPrimaryTextColor,
            footerBackgroundColor: values.thFooterBackgroundColor,
            footerTextColor: values.thFooterTextColor,
            gdprBackgroundColor: values.thGdprBackgroundColor,
            gdprTextColor: values.thGdprTextColor,
            gdprAcceptBtnColor: values.thGdprAcceptBtnColor,
            gdprAcceptBtnTextColor: values.thGdprAcceptBtnTextColor,
            gdprDeclineBtnColor: values.thGdprDeclineBtnColor,
            gdprDeclineBtnTextColor: values.thGdprDeclineBtnTextColor
          },
          features: {
            showPrintedVersion: values.feShowPrintedVersion,
            showRegions: values.feShowRegions,
            showLanguages: values.feShowLanguages,
            showFlags: values.feShowFlags
          },
          welcome_text: langValues
        };

        if (dropzoneState.file) {
          let logoSuccess = true;
          const timestamp = Date.now();
          const logoExt = dropzoneState.file.name.split('.').pop();
          const logoKey = `assets/logo-${timestamp}.${logoExt}`;
          data.company.logo = logoKey;

          await uploadFile(dropzoneState.file, logoKey, 'logo').catch((error) => {
            console.error(error);
            setErrorAlertState({ open: true, message: 'There was an error processing your logo image!' });
            logoSuccess = false;
          });

          if (!logoSuccess) {
            return;
          }
        }

        if (dropzoneIconState.file) {
          let iconSuccess = true;
          const timestamp = Date.now();
          const iconExt = dropzoneIconState.file.name.split('.').pop();
          const iconKey = `assets/icon-${timestamp}.${iconExt}`;
          data.company.icon = iconKey;

          await uploadFile(dropzoneIconState.file, iconKey, 'icon').catch((error) => {
            console.error(error);
            setErrorAlertState({ open: true, message: 'There was an error processing your icon image!' });
            iconSuccess = false;
          });

          if (!iconSuccess) {
            return;
          }
        }

        return makeApiRequest(data);
      } catch (error) {
        console.error(error);
        setErrorAlertState({ open: true, message: 'There was an error processing your request!' });
      }
    }
  });

  return (
    <PageWrapper
      org={orgSlug}
      profile={profile}
      loading={loadingProfile || (pageAccess && loadingLicenseConfig)}
      pageAccess={pageAccess}
    >
      <Box className={styles.form__container}>
        <SoomCard dataTestId="prueba" ariaLabel="prueba">
          <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
            <Typography variant="h6" component="div">
              <DisplaySettingsIcon sx={{ verticalAlign: 'middle' }} /> Web App Settings
            </Typography>
          </Stack>
          <Divider className={styles.divider__header} />
          {editLicenseConfig ? (
            <form noValidate className={styles.form} onSubmit={formik.handleSubmit}>
              <Stepper alternativeLabel nonLinear activeStep={activeStep} className={styles.stepper}>
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel>{steps[index].label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <SwipeableViews index={activeStep}>
                {steps.map((step, index) => {
                  const Component = steps[index];
                  return (
                    <Component
                      key={index}
                      formik={formik}
                      languages={languages}
                      customizeWelcomeText={customizeWelcomeText}
                      setCustomizeWelcomeText={setCustomizeWelcomeText}
                      isAnalyticsAdmin={isAnalyticsAdmin}
                      customDomainEnabled={customDomainEnabled}
                      logoDimensions={logoDimensions}
                      dropzoneState={dropzoneState}
                      handleOnChangeDropzoneArea={handleOnChangeDropzoneArea}
                      handleOnCancelDropzoneArea={handleOnCancelDropzoneArea}
                      iconDimensions={iconDimensions}
                      dropzoneIconState={dropzoneIconState}
                      handleOnChangeDropzoneAreaIcon={handleOnChangeDropzoneAreaIcon}
                      handleOnCancelDropzoneAreaIcon={handleOnCancelDropzoneAreaIcon}
                    />
                  );
                })}
              </SwipeableViews>
              <Divider className={styles.divider__buttons} />
              {showAlert && (
                <SoomAlert dataTestId="settings" ariaLabel="settingsMessage" severity="success">
                  <SoomTypography
                    dataTestId="successMessage"
                    ariaLabel="successMessage"
                    text="Settings saved successfully"
                    variant="body1"
                    component="span"
                  />
                </SoomAlert>
              )}
              {errorAlertState.open && (
                <SoomAlert dataTestId="settings" ariaLabel="settingsMessage" severity="error">
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
                {licenseConfig && (
                  <SoomButton
                    dataTestId="btnCancel"
                    ariaLabel="Cancel"
                    label="Cancel"
                    variant="outlined"
                    handlerOnClick={handleCancel}
                    disabled={formik.isSubmitting}
                  />
                )}
                <SoomButton
                  dataTestId="btnPrevious"
                  ariaLabel="Previous"
                  label="Previous"
                  variant="contained"
                  handlerOnClick={handlePrevious}
                  disabled={formik.isSubmitting || activeStep === 0}
                />
                <SoomButton
                  type="submit"
                  dataTestId="btnNext"
                  ariaLabel="Next"
                  label={isLastStep() ? 'Submit' : 'Next'}
                  variant="contained"
                  loading={formik.isSubmitting}
                  disabled={incorrectLogoDimensions || incorrectIconDimensions}
                />
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ margin: '15px 10px' }}>
                <Typography variant="body1">
                  {licenseConfig.is_production
                    ? `The configuration is published in production environment.`
                    : `The configuration is not yet published in the production environment. You can see a preview web app before you publish it in the link below.`}
                </Typography>
              </div>
              <Divider />
              <div style={{ margin: '15px 10px' }}>
                <Typography variant="body2">
                  <strong>Preview: </strong>
                  <a
                    className={styles.link_redir}
                    href={_get(profile, 'domains.preview', '/')}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {_get(profile, 'domains.preview', '/')}
                  </a>
                </Typography>
                <Typography variant="body2">
                  <strong>Production: </strong>
                  <a
                    className={styles.link_redir}
                    href={_get(profile, 'domains.production', '/')}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {_get(profile, 'domains.production', '/')}
                  </a>
                </Typography>
                {formik.values.coCustomDomain !== '' && (
                  <>
                    <Typography variant="body2">
                      <strong>Production Custom Domain: </strong>
                      <a
                        className={styles.link_redir}
                        href={`https://${formik.values.coCustomDomain}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {`https://${formik.values.coCustomDomain}`}
                      </a>
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <div style={{ textAlign: 'left' }}>
                      <Stack spacing={2}>
                        {customDomainSettings.showDomainInstructions && (
                          <SoomAlert dataTestId="publish" ariaLabel="publishMessage" severity="info">
                            <AlertTitle>Custom Domain Configuration</AlertTitle>
                            <SoomTypography
                              dataTestId="domainMsg"
                              ariaLabel="domainMsg"
                              text={`Set the following record on your DNS provider to enable your custom domain ${formik.values.coCustomDomain}`}
                              variant="body1"
                              component="span"
                            />
                            <SoomTypography
                              dataTestId="domainMsg"
                              ariaLabel="domainMsg"
                              text={`Type: A Name: @ Value: 76.76.21.21`}
                              variant="body2"
                              component="span"
                            />
                          </SoomAlert>
                        )}
                        {customDomainSettings.showSubDomainInstructions && (
                          <SoomAlert dataTestId="publish" ariaLabel="publishMessage" severity="info">
                            <AlertTitle>Custom Subdomain Configuration</AlertTitle>
                            <SoomTypography
                              dataTestId="subdomainMsg"
                              ariaLabel="subdomainMsg"
                              text={`Set the following record on your DNS provider to enable your custom subdomain ${formik.values.coCustomDomain}`}
                              variant="body1"
                              component="span"
                            />
                            <SoomTypography
                              dataTestId="subdomainMsg"
                              ariaLabel="subdomainMsg"
                              text={`Type: CNAME Name: ${customDomainSettings.subdomain} Value: cname.vercel-dns.com.`}
                              variant="body2"
                              component="span"
                            />
                          </SoomAlert>
                        )}
                      </Stack>
                    </div>
                  </>
                )}
              </div>
              <Divider />
              {showAlertPublish && (
                <SoomAlert dataTestId="publish" ariaLabel="publishMessage" severity="success">
                  <SoomTypography
                    dataTestId="successPublishMessage"
                    ariaLabel="successPublishMessage"
                    text="Settings saved successfully"
                    variant="body1"
                    component="span"
                  />
                </SoomAlert>
              )}
              {errorAlertPublishState.open && (
                <SoomAlert dataTestId="publish" ariaLabel="publishMessage" severity="error">
                  <SoomTypography
                    dataTestId="errorPublishMessage"
                    ariaLabel="errorPublishMessage"
                    text={errorAlertPublishState.message}
                    variant="body1"
                    component="span"
                  />
                </SoomAlert>
              )}
              <div className={styles.buttons__container} style={{ justifyContent: 'center', margin: '15px 10px' }}>
                <SoomButton
                  dataTestId="btnEdit"
                  ariaLabel="Edit/View Settings"
                  label="Edit/View Settings"
                  variant="contained"
                  handlerOnClick={handleEditConfig}
                  disabled={isSubmittingPublish}
                />
                {!licenseConfig.is_production && (
                  <SoomButton
                    dataTestId="btnNext"
                    ariaLabel="Next"
                    label="Publish Settings"
                    variant="contained"
                    handlerOnClick={handlePublishConfig}
                    loading={isSubmittingPublish}
                  />
                )}
              </div>
            </div>
          )}
        </SoomCard>
      </Box>
    </PageWrapper>
  );
});
