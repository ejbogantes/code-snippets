/* eslint-disable dot-notation */
/* eslint-disable react-hooks/exhaustive-deps */
import styles from './index.module.scss';

import React, { useState, useEffect } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import { get as _get } from 'lodash';

import { Box, Stack, Grid, Divider, Typography } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

import {
  SoomAlert,
  SoomButton,
  SoomCard,
  SoomTextField,
  SoomTypography,
  SoomSelect,
  SoomSwitch
} from '@soom-universe/soom-ui';

// helpers
import {
  requestGetProfileByEmailOrg,
  requestGetRolesByApp,
  requestGetUserData,
  requestUpdateUserData
} from '../../../../../helpers/request';
import { hasAccess } from '../../../../../helpers/PermissionValidator';

import PageWrapper from '../../../../../wrappers/pageWrapper';

import { useFormik } from 'formik';
import * as yup from 'yup';

// get public runtime settings
const {
  publicRuntimeConfig: { appName }
} = getConfig();

export default withPageAuthRequired(function Edit({ user }) {
  const router = useRouter();

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
  const [loadingUserData, setLoadingUserData] = useState(true);
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
      const pageAccess = hasAccess('editUser', profile);

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
    };

    fetchProfileData();
  }, [org]);

  useEffect(() => {
    if (!profile || !pageAccess) return;

    const fetchUserData = async () => {
      try {
        const { id } = router.query;
        const userInfo = await requestGetUserData(id, appName, org);
        if (!userInfo) {
          handleCancel();
          return;
        }
        if (userInfo.organizationProfiles.length <= 0) {
          handleCancel();
          return;
        }

        const organizationProfileUser = userInfo.organizationProfiles[0];

        setUserId(userInfo.profile_id);
        formik.setFieldValue('txtFirstName', userInfo.first_name);
        formik.setFieldValue('txtLastName', userInfo.last_name);
        formik.setFieldValue('txtEmail', userInfo.email);
        formik.setFieldValue('txtCompany', userInfo.company);
        formik.setFieldValue('cboRole', organizationProfileUser.role_id);
        formik.setFieldValue('cboBusinessUnit', organizationProfileUser.business_unit_id || -1);
        formik.setFieldValue('swEnabled', organizationProfileUser.enabled);
        setLoadingUserData(false);
      } catch (error) {
        console.error(error);
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [profile, pageAccess]);

  const handleCancel = () => {
    router.push(`/org/${org}/users`);
  };

  const formik = useFormik({
    enableReinitialize: true,
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
        const editUser = {
          first_name: values.txtFirstName,
          last_name: values.txtLastName,
          email: values.txtEmail,
          company: values.txtCompany,
          enabled: values.swEnabled,
          role_id: values.cboRole,
          business_unit_id: businessUnits.length > 0 ? values.cboBusinessUnit : undefined,
          org,
          app: appName,
          new: false
        };

        const result = await requestUpdateUserData(userId, editUser);

        if (result.error) {
          setShowErrorAlert({ open: true, message: result.data.message });
          return;
        }

        setShowAlert(true);
      } catch (error) {
        // console.error(error);
        setShowErrorAlert({ open: true, message: error.message });
      }
    }
  });

  return (
    <PageWrapper
      org={org}
      profile={profile}
      loading={loadingProfile || (pageAccess && loadingUserData)}
      pageAccess={pageAccess}
    >
      <Box className={styles.form__container}>
        <SoomCard dataTestId="prueba" ariaLabel="prueba">
          <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
            <Typography variant="h5" component="div">
              <PersonIcon sx={{ verticalAlign: 'middle' }} /> Editing User{' '}
              {user ? <strong>{formik.values.txtEmail}</strong> : ''}
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
                  disabled={formik.isSubmitting}
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
                  disabled={formik.isSubmitting}
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
                  disabled={formik.isSubmitting}
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
                  handleOnChange={formik.handleChange}
                  disabled={formik.isSubmitting}
                />
              </Grid>
            </Grid>
            <Divider className={styles.divider__buttons} />
            {showAlert && (
              <SoomAlert ariaLabel="AlertDiv" severity="success">
                <SoomTypography
                  ariaLabel="AlertMessage"
                  text="The user was updated successfully"
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
                ariaLabel="Edit"
                variant="contained"
                handlerOnClick={formik.handleSubmit}
                label="Edit"
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
