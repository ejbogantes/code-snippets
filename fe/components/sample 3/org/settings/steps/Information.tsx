import styles from './index.module.scss';

import React, { useState } from 'react';

// material ui stuff
import { Grid, Divider, InputAdornment, IconButton } from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { MuiChipsInput } from 'mui-chips-input';

// soom-ui
import { SoomAlert, SoomTypography, SoomTextField, SoomSelect } from '@soom-universe/soom-ui';

// get soom constants
import { countries as regionsList, languagesDashboard as languagesList } from '@soom-universe/soom-utils/constants';

const Information = (props) => {
  const { formik, canEdit, audienceSelectorEnabled } = props;

  const [showPasswordPreview, setShowPasswordPreview] = useState(false);
  const [showPasswordProd, setShowPasswordProd] = useState(false);

  const handleClickShowPasswordPreview = () => setShowPasswordPreview((show) => !show);

  const handleMouseDownPasswordPreview = (event) => {
    event.preventDefault();
  };

  const handleClickShowPasswordProd = () => setShowPasswordProd((show) => !show);

  const handleMouseDownPasswordProd = (event) => {
    event.preventDefault();
  };

  return (
    <div className={styles['form-step']}>
      <Grid container spacing={1} sx={{ m: 0 }}>
        <Grid container direction="row" spacing={3}>
          <Grid item xs={12} md={12}>
            {canEdit && (
              <SoomAlert dataTestId="WarningAlertDiv" ariaLabel="WarningAlertDiv" severity="warning" sx={{ mb: 2 }}>
                <SoomTypography
                  dataTestId="warningMessage"
                  ariaLabel="warningMessage"
                  text="Manufacturer value can only be set once. This value and Manufacturer aliases must match what you have in the GUDID."
                  variant="body1"
                  component="span"
                />
              </SoomAlert>
            )}
            <SoomTextField
              fullWidth
              dataTestId="manufacturer"
              ariaLabel="Manufacturer"
              id="manufacturer"
              name="manufacturer"
              variant="outlined"
              label="Manufacturer"
              placeholder="Enter a manufacturer name. e.g. Merck, Cordis, Bayer"
              required={true}
              value={formik.values.manufacturer}
              handlerOnChange={formik.handleChange}
              error={formik.touched.manufacturer && Boolean(formik.errors.manufacturer)}
              helperText={
                formik.touched.manufacturer && formik.errors.manufacturer
                  ? String(formik.errors.manufacturer)
                  : undefined
              }
              disabled={!canEdit}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <MuiChipsInput
              fullWidth
              id="manufacturerAlias"
              name="manufacturerAlias"
              label="Manufacturer aliases"
              placeholder={`Type and press enter. e.g. ABC "enter" Xyz "enter"`}
              required={true}
              value={formik.values.manufacturerAlias}
              onChange={(chips) => {
                formik.setFieldValue('manufacturerAlias', chips);
              }}
              onKeyDown={(e) => {
                // block ',' for conflicts with the functionality
                if (e.key === ',') {
                  e.preventDefault();
                  return false;
                }
              }}
              error={formik.touched.manufacturerAlias && Boolean(formik.errors.manufacturerAlias)}
              helperText={
                formik.touched.manufacturerAlias && formik.errors.manufacturerAlias
                  ? String(formik.errors.manufacturerAlias)
                  : undefined
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SoomTextField
              fullWidth
              dataTestId="notificationsEmail"
              ariaLabel="Notifications email"
              id="notificationsEmail"
              name="notificationsEmail"
              variant="outlined"
              label="Notifications email"
              placeholder="Enter a valid email address. e.g. jane@aol.com"
              required={true}
              value={formik.values.notificationsEmail}
              handlerOnChange={formik.handleChange}
              error={formik.touched.notificationsEmail && Boolean(formik.errors.notificationsEmail)}
              helperText={
                formik.touched.notificationsEmail && formik.errors.notificationsEmail
                  ? String(formik.errors.notificationsEmail)
                  : undefined
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SoomTextField
              fullWidth
              dataTestId="phoneNumber"
              ariaLabel="Phone Number"
              id="phoneNumber"
              name="phoneNumber"
              variant="outlined"
              label="Phone number"
              placeholder="Enter a valid phone number"
              required={true}
              value={formik.values.phoneNumber}
              handlerOnChange={formik.handleChange}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={
                formik.touched.phoneNumber && formik.errors.phoneNumber ? String(formik.errors.phoneNumber) : undefined
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SoomSelect
              dataTestId="languages"
              ariaLabel="Languages"
              required={true}
              options={languagesList}
              isMultiple={true}
              id="languages"
              name="languages"
              label="Languages"
              labelId="languagesLabel"
              value={formik.values.languages}
              disabledValue={process.env.DEFAULT_LANGUAGE}
              onChange={formik.handleChange}
              error={formik.touched.languages && Boolean(formik.errors.languages)}
              textError={
                formik.touched.languages && formik.errors.languages ? String(formik.errors.languages) : undefined
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SoomSelect
              dataTestId="regions"
              ariaLabel="Regions"
              options={regionsList}
              isMultiple={true}
              id="regions"
              name="regions"
              label="Regions"
              labelId="regionsLabel"
              value={formik.values.regions}
              onChange={formik.handleChange}
              error={formik.touched.regions && Boolean(formik.errors.regions)}
              textError={formik.touched.regions && formik.errors.regions ? String(formik.errors.regions) : undefined}
            />
          </Grid>
          {audienceSelectorEnabled && (
            <Grid item xs={12} md={6}>
              <SoomSelect
                dataTestId="doctor_audience"
                ariaLabel="Audience"
                options={[
                  { value: '0', label: 'Patients' },
                  { value: '1', label: 'Patients and Clinicians' }
                ]}
                id="doctor_audience"
                name="doctor_audience"
                label="Audience"
                labelId="doctor_audienceLabel"
                value={formik.values.doctor_audience ? '1' : '0'}
                onChange={(e) => {
                  const realValue = e.target.value === '1';
                  formik.setFieldValue('doctor_audience', realValue);
                }}
                error={formik.touched.doctor_audience && Boolean(formik.errors.doctor_audience)}
                textError={
                  formik.touched.doctor_audience && formik.errors.doctor_audience
                    ? String(formik.errors.doctor_audience)
                    : undefined
                }
              />
            </Grid>
          )}
        </Grid>
        <Divider orientation="horizontal" flexItem sx={{ width: '100%', py: 1 }}>
          <strong>Password Protection</strong>
        </Divider>
        <Grid container direction="row" spacing={3}>
          <Grid item xs={12} md={6}>
            <SoomTextField
              fullWidth
              type={showPasswordPreview ? 'text' : 'password'}
              dataTestId="webapp_password_preview"
              ariaLabel="Web App Preview Password"
              id="webapp_password_preview"
              name="webapp_password_preview"
              variant="outlined"
              label="Web App Preview Password"
              placeholder="Enter a password to add protection to the Web App"
              value={formik.values.webapp_password_preview}
              handlerOnChange={formik.handleChange}
              error={formik.touched.webapp_password_preview && Boolean(formik.errors.webapp_password_preview)}
              helperText={
                formik.touched.webapp_password_preview && formik.errors.webapp_password_preview
                  ? String(formik.errors.webapp_password_preview)
                  : undefined
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPasswordPreview}
                    onMouseDown={handleMouseDownPasswordPreview}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPasswordPreview ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SoomTextField
              fullWidth
              type={showPasswordProd ? 'text' : 'password'}
              dataTestId="webapp_password_production"
              ariaLabel="Web App Production Password"
              id="webapp_password_production"
              name="webapp_password_production"
              variant="outlined"
              label="Web App Production Password"
              placeholder="Enter a password to add protection to the Web App"
              value={formik.values.webapp_password_production}
              handlerOnChange={formik.handleChange}
              error={formik.touched.webapp_password_production && Boolean(formik.errors.webapp_password_production)}
              helperText={
                formik.touched.webapp_password_production && formik.errors.webapp_password_production
                  ? String(formik.errors.webapp_password_production)
                  : undefined
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPasswordProd}
                    onMouseDown={handleMouseDownPasswordProd}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPasswordProd ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

Information.label = 'Information';

export default Information;
