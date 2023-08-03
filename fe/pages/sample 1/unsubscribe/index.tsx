/* eslint-disable dot-notation */
/* eslint-disable react-hooks/exhaustive-deps */

// styles, react and nextjs
import styles from './index.module.scss';
import React, { useState, useEffect } from 'react';
import getConfig from 'next/config';
import Image from 'next/image';
import { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';

// material ui
import { Box, Stack, Grid, Divider, Typography } from '@mui/material';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// soom-ui
import { SoomButton, SoomCard, SoomCheckbox } from '@soom-universe/soom-ui';

// formik
import { useFormik } from 'formik';

// requests
import { requestUnsubscribe } from '../../helpers/request';

// helpers
import clientConfigLoader from '../../helpers/clientConfigLoader';

// get public runtime settings
const {
  publicRuntimeConfig: { defaultLogo }
} = getConfig();

export function Unsubscribe(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { config, company } = props;

  const router = useRouter();
  const { locale } = router;

  const [data, setData] = useState({ email: null, documentNumber: null });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const email = router.query.e ? router.query.e.toString() : '';
    const documentNumber = router.query.dn ? router.query.dn.toString() : '';

    if (email === '' || documentNumber === '') {
      router.push('/');
      return;
    }

    setData({ email, documentNumber });
  }, [router.isReady]);

  // formik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      deleteData: false
    },
    onSubmit: async (values) => {
      const params = {
        configId: config.ident,
        documentNumber: data.documentNumber,
        email: data.email,
        deleteData: values.deleteData
      };
      const headers = { 'Accept-Language': locale };

      try {
        await requestUnsubscribe(params, headers);

        setSuccess(true);
      } catch (error) {
        setSuccess(true);
      }
    }
  });

  return (
    <Box sx={{ width: '100%', padding: 2, marginBottom: 4 }}>
      <div style={{ visibility: 'hidden', fontSize: '1px', margin: '0px', position: 'absolute' }}>
        <Typography component="h1">{`${company.SEOTitle} Unsubscribe`}</Typography>
      </div>

      <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={10} md={3} sx={{ width: '600px' }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            style={{ textAlign: 'center' }}
            sx={{
              height: 200
            }}
          >
            <Image
              src={company.logo && company.logo !== '' ? company.logo : defaultLogo}
              alt={company.SEOTitle ? company.SEOTitle : 'Web App Site'}
              width={300}
              height={150}
              priority={true}
            />
          </Box>
          {data.email && data.documentNumber && (
            <Box sx={{ mt: 1 }}>
              <SoomCard dataTestId="prueba" ariaLabel="prueba">
                <Stack direction="row" className={styles.heading_background}>
                  <Typography variant="h6" className={styles.heading}>
                    Unsubscribe
                  </Typography>
                </Stack>
                <Divider />
                {!success ? (
                  <form className={styles.form} onSubmit={formik.handleSubmit}>
                    <Grid container spacing={0}>
                      <Grid item xs={12} md={12} sx={{ textAlign: 'center' }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          You will not receive any more emails to <strong>{data.email}</strong> for updates and
                          corrective actions for document <strong>#{data.documentNumber}</strong>.
                        </Typography>
                        <SoomCheckbox
                          label="Delete subscription data permanently"
                          labelPlacement="end"
                          size="medium"
                          defaultChecked={formik.values.deleteData}
                          handlerOnChange={(event, checked) => {
                            formik.setFieldValue('deleteData', checked);
                          }}
                          handlerOnBlur={() => {
                            formik.setFieldTouched('deleteData', true);
                          }}
                          error={formik.touched.deleteData && Boolean(formik.errors.deleteData)}
                          helperText={formik.touched.deleteData && formik.errors.deleteData}
                        />
                      </Grid>
                    </Grid>
                    <Divider />
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <SoomButton
                        dataTestId="btnSave"
                        ariaLabel="Unsubscribe"
                        variant="contained"
                        label="Unsubscribe"
                        type="submit"
                        loading={formik.isSubmitting}
                      />
                    </div>
                  </form>
                ) : (
                  <Grid container spacing={0} sx={{ my: 2 }}>
                    <Grid item xs={12} md={12} sx={{ textAlign: 'center' }}>
                      <Typography variant="h2">
                        <CheckCircleOutlineIcon color="success" fontSize="inherit" />
                      </Typography>
                      <Typography variant="body1">
                        You have been successfully removed from this subscriber list.
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </SoomCard>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

// This gets called on every request
export const getServerSideProps = async (context) => {
  const clientConfig = await clientConfigLoader(context);

  // welcome text
  delete clientConfig.welcomeText;

  // Pass data to the page via props
  return { props: { ...clientConfig } };
};

export default Unsubscribe;
