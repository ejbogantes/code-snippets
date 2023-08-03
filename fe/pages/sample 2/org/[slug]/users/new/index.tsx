/* eslint-disable react-hooks/exhaustive-deps */
import styles from './index.module.scss';

import React, { useState, useEffect } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { get as _get } from 'lodash';

import { Box, Stack, Grid, Divider, Typography } from '@mui/material';
import { PersonAdd as PersonAddIcon, WarningAmberOutlined as WarningAmberOutlinedIcon } from '@mui/icons-material';

import {
  SoomAlert,
  SoomButton,
  SoomCard,
  SoomTextField,
  SoomTypography,
  SoomSelect,
  SoomSwitch
} from '@soom-universe/soom-ui';

import * as yup from 'yup';
import { useFormik } from 'formik';

import PageWrapper from '../../../../../wrappers/pageWrapper';

// helpers
import {
  requestGetProfileByEmailOrg,
  requestGetRolesByApp,
  requestCreateUser,
  requestGetUserDataByEmail,
  requestUpdateUserData
} from '../../../../../helpers/request';
import { hasAccess } from '../../../../../helpers/PermissionValidator';

// get public runtime settings
const {
  publicRuntimeConfig: { appName }
} = getConfig();

// form autocomplete
let formAutocompleteTimeout = null;

const defaultWarningMessage = 'There were some errors.';

export default withPageAuthRequired(function New({ user }) {
  const router = useRouter();

  const [email, setEmail] = useState<string>(undefined);
  const [org, setOrg] = useState<string>(undefined);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(undefined);
  const [pageAccess, setPageAccess] = useState(false);
  const [roles, setRoles] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showErrorAlert, setShowErrorAlert] = useState<{ open: boolean; message: string }>({
    open: false,
    message: ''
  });
  const [showWarningAlert, setShowWarningAlert] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>(defaultWarningMessage);
  const [userId, setUserId] = useState<number>();

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
      const pageAccess = hasAccess('newUser', profile);

      const roles = await requestGetRolesByApp(appName);
      setRoles(
        roles.map((item) => {
          return { value: item.role_id, label: item.name };
        })
      );

      const businessUnit = _get(profile, 'organizationProfiles[0].businessUnit', null);
      if (!businessUnit && profile.orgBusinessUnits && profile.orgBusinessUnits.length > 0) {
        const buList = profile.orgBusinessUnits.map((item) => {
          return { value: item.business_unit_id, label: item.name };
        });
        buList.unshift({ value: -1, label: 'All Business Units' });
        setBusinessUnits(buList);
      }

      setProfile(profile);
      setPageAccess(pageAccess);
      setLoadingProfile(false);
      formik.setFieldValue('txtCompany', profile.company);
    };

    fetchProfileData();
  }, [org]);

  useEffect(() => {
    if (email === undefined) return;

    clearTimeout(formAutocompleteTimeout);
    formAutocompleteTimeout = setTimeout(() => {
      fetchUserData();
    }, 1000);
  }, [email]);

  const fetchUserData = async () => {
    try {
      let userInfo;
      if (email !== '') {
        userInfo = await requestGetUserDataByEmail(email);
      }

      if (userInfo) {
        setUserId(userInfo.profile_id);
        formik.setFieldValue('txtFirstName', userInfo.first_name || '');
        formik.setFieldValue('txtLastName', userInfo.last_name || '');
        formik.setFieldValue('txtCompany', userInfo.company || profile.company);
        formik.setFieldValue('swEnabled', userInfo.enabled);
        setShowWarningAlert(true);
        setWarningMessage(
          'The user already exists in our database. Select a role and click on the button "Add" to give access to your app.'
        );
      } else {
        setUserId(undefined);
        setShowWarningAlert(false);
        formik.setFieldValue('txtFirstName', '');
        formik.setFieldValue('txtLastName', '');
        formik.setFieldValue('txtCompany', profile.company);
        formik.setFieldValue('swEnabled', true);
        setWarningMessage(defaultWarningMessage);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    router.push(`/org/${org}/users`);
  };

  const formik = useFormik({
    initialValues: {
      txtFirstName: '',
      txtLastName: '',
      txtEmail: '',
      txtCompany: '',
      cboRole: '',
      cboBusinessUnit: '',
      swEnabled: true
    },
    validationSchema: yup.object({
      txtFirstName: yup.string().required('Name is required'),
      txtLastName: yup.string().required('Last name is required'),
      txtEmail: yup.string().required('Email is required').email('Invalid email'),
      txtCompany: yup.string(),
      cboRole: yup.string().required('Role is required'),
      cboBusinessUnit: businessUnits.length > 0 ? yup.number().required('Business unit is required') : undefined,
      swEnabled: yup.boolean()
    }),
    onSubmit: async (values) => {
      setShowAlert(false);
      setShowErrorAlert({ open: false, message: '' });

      try {
        const newUserData = {
          first_name: values.txtFirstName,
          last_name: values.txtLastName,
          email: values.txtEmail,
          company: values.txtCompany,
          enabled: values.swEnabled,
          role_id: values.cboRole,
          business_unit_id: businessUnits.length > 0 ? values.cboBusinessUnit : undefined,
          org,
          app: appName,
          new: Boolean(userId)
        };

        const result = userId ? await requestUpdateUserData(userId, newUserData) : await requestCreateUser(newUserData);

        if (result.error) {
          setShowErrorAlert({ open: true, message: result.data.message });
          return;
        }

        setShowAlert(true);
        router.push(`/org/${org}/users/edit/${result.profile_id}`);
      } catch (error) {
        // console.error(error);
        setShowErrorAlert({ open: true, message: error.message });
      }
    }
  });

  return (
    <PageWrapper org={org} profile={profile} loading={loadingProfile} pageAccess={pageAccess}>
      <Box className={styles.form__container}>
        <SoomCard dataTestId="prueba" ariaLabel="prueba">
          <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
            <Typography variant="h6" component="div">
              <PersonAddIcon sx={{ verticalAlign: 'middle' }} /> Add user
            </Typography>
          </Stack>
          <Divider className={styles.divider__header} />
          <form className={styles.form} onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <SoomTextField
                  fullWidth
                  dataTestId="txtEmail"
                  ariaLabel="Email"
                  id="txtEmail"
                  name="txtEmail"
                  variant="outlined"
                  label="Email"
                  placeholder="Enter a valid email address. e.g. abc@aol.com"
                  required={true}
                  value={formik.values.txtEmail}
                  handlerOnChange={(event: { target: { value } }) => {
                    event.target.value = event.target.value.toLowerCase();
                    formik.handleChange(event);
                    setEmail(event.target.value);
                  }}
                  error={formik.touched.txtEmail && Boolean(formik.errors.txtEmail)}
                  helperText={formik.touched.txtEmail && formik.errors.txtEmail}
                  disabled={formik.isSubmitting}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SoomTextField
                  fullWidth
                  dataTestId="txtCompany"
                  ariaLabel="Company"
                  id="txtCompany"
                  name="txtCompany"
                  variant="outlined"
                  label="Company"
                  placeholder="Enter a company name. e.g Soom, Toyota, Apple"
                  required={false}
                  value={formik.values.txtCompany}
                  handlerOnChange={formik.handleChange}
                  error={formik.touched.txtCompany && Boolean(formik.errors.txtCompany)}
                  helperText={formik.touched.txtCompany && formik.errors.txtCompany}
                  disabled={formik.isSubmitting || (userId !== undefined && formik.values.txtCompany !== '')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SoomTextField
                  fullWidth
                  dataTestId="txtFirstName"
                  ariaLabel="First Name"
                  id="txtFirstName"
                  name="txtFirstName"
                  variant="outlined"
                  label="First Name"
                  placeholder="Enter a first name. e.g Martin, Charlie, Emilio, Ana"
                  required={true}
                  value={formik.values.txtFirstName}
                  handlerOnChange={formik.handleChange}
                  error={formik.touched.txtFirstName && Boolean(formik.errors.txtFirstName)}
                  helperText={formik.touched.txtFirstName && formik.errors.txtFirstName}
                  disabled={formik.isSubmitting || (userId !== undefined && formik.values.txtFirstName !== '')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SoomTextField
                  fullWidth
                  dataTestId="txtLastName"
                  ariaLabel="Last Name"
                  id="txtLastName"
                  name="txtLastName"
                  variant="outlined"
                  label="Last Name"
                  placeholder="Enter a last name. e.g Smith, Waters"
                  required={true}
                  value={formik.values.txtLastName}
                  handlerOnChange={formik.handleChange}
                  error={formik.touched.txtLastName && Boolean(formik.errors.txtLastName)}
                  helperText={formik.touched.txtLastName && formik.errors.txtLastName}
                  disabled={formik.isSubmitting || (userId !== undefined && formik.values.txtLastName !== '')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SoomSelect
                  isMultiple={false}
                  required
                  options={roles}
                  id="cboRole"
                  name="cboRole"
                  label="Role"
                  labelId="cboRoleLabel"
                  error={formik.touched.cboRole && Boolean(formik.errors.cboRole)}
                  textError={formik.errors.cboRole}
                  value={formik.values.cboRole}
                  onChange={formik.handleChange}
                  disabled={formik.isSubmitting}
                />
              </Grid>
              {businessUnits.length > 0 && (
                <Grid item xs={12} md={6}>
                  <SoomSelect
                    isMultiple={false}
                    required
                    options={businessUnits}
                    id="cboBusinessUnit"
                    name="cboBusinessUnit"
                    label="Business Unit"
                    labelId="cboBusinessUnitLabel"
                    error={formik.touched.cboBusinessUnit && Boolean(formik.errors.cboBusinessUnit)}
                    textError={formik.errors.cboBusinessUnit}
                    value={formik.values.cboBusinessUnit}
                    onChange={formik.handleChange}
                    disabled={formik.isSubmitting}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <SoomSwitch
                  color="primary"
                  isChecked={formik.values.swEnabled}
                  name="swEnabled"
                  label="Active"
                  handleOnChange={(event) => {
                    formik.setFieldValue('swEnabled', event.target.checked);
                  }}
                  disabled={formik.isSubmitting}
                />
              </Grid>
              {showWarningAlert && (
                <Grid item xs={12} md={12}>
                  <Typography variant="body1" component="div" sx={{ color: 'warning.main' }}>
                    <WarningAmberOutlinedIcon sx={{ mb: '-4px' }} /> {warningMessage}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Divider className={styles.divider__buttons} />
            {showAlert && (
              <SoomAlert dataTestId="prueba" ariaLabel="Message" severity="success">
                <SoomTypography
                  dataTestId="prueba"
                  ariaLabel="prueba"
                  text="The user was successfully created. You will be redirected in a second..."
                  variant="body1"
                  component="span"
                />
              </SoomAlert>
            )}
            {showErrorAlert.open && (
              <SoomAlert dataTestId="prueba" ariaLabel="Message" severity="error">
                <SoomTypography
                  dataTestId="prueba"
                  ariaLabel="prueba"
                  text={showErrorAlert.message}
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
                ariaLabel="Add"
                variant="contained"
                handlerOnClick={formik.handleSubmit}
                label="Add"
                type="submit"
                loading={formik.isSubmitting}
              />
            </div>
          </form>
        </SoomCard>
      </Box>
    </PageWrapper>
  );
});
