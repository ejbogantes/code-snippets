/* eslint-disable @next/next/no-img-element */
import styles from './PasswordProtection.module.scss';

import React, { useState } from 'react';

// material-ui
import { Box, Divider, Grid, Stack, InputAdornment, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// soom-ui
import { SoomButton, SoomCard, SoomTypography, SoomTextField } from '@soom-universe/soom-ui';

// formik and yup
import * as yup from 'yup';
import { useFormik } from 'formik';

// requests
import { requestPassword } from '../helpers/request';

const PasswordProtection = (props) => {
  const { children } = props;

  const [showChildren, setShowChildren] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      password: ''
    },
    validationSchema: yup.object({
      password: yup.string().required('Password is required')
    }),
    onSubmit: async (values) => {
      try {
        const data = {
          password: values.password
        };

        const result = await requestPassword(data);
        if (!result) {
          formik.setFieldError('password', 'Invalid password');
          return;
        }

        setShowChildren(true);
      } catch (error) {
        console.error(error);
      }
    }
  });

  return showChildren ? (
    children
  ) : (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" pt={15} pb={15}>
      <Grid item xs={12} sm={10} md={3} sx={{ minWidth: '400px' }}>
        <Box sx={{ width: '100%' }} style={{ textAlign: 'left' }}>
          <SoomCard sx={{ width: '100%' }} dataTestId="prueba" ariaLabel="prueba">
            <Stack direction="row" className={styles.pass_protect_heading_background}>
              <SoomTypography
                variant="h6"
                component="h6"
                text={`Password Required`}
                dataTestId="txt-company-name"
                ariaLabel={`Password Required`}
                align="left"
                className={styles.pass_protect_heading}
              />
            </Stack>
            <Divider />
            <form className={styles.form} onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <SoomTextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    dataTestId="password"
                    ariaLabel="Web App  Password"
                    id="password"
                    name="password"
                    variant="outlined"
                    label="Password"
                    value={formik.values.password}
                    handlerOnChange={formik.handleChange}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={
                      formik.touched.password && formik.errors.password ? String(formik.errors.password) : undefined
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          tabIndex={-1}
                        >
                          {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Grid>
              </Grid>
              <Divider />
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <SoomButton
                  dataTestId="btnSave"
                  ariaLabel="Continue"
                  variant="contained"
                  label="Continue"
                  type="submit"
                  loading={formik.isSubmitting}
                  disabled={formik.values.password === ''}
                />
              </div>
            </form>
          </SoomCard>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PasswordProtection;
