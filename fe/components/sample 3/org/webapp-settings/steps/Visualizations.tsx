import React from 'react';
import { Grid } from '@mui/material';
import { SoomSwitch } from '@soom-universe/soom-ui';
import styles from './index.module.scss';

const Visualizations = (props) => {
  const { formik } = props;

  return (
    <div className={styles['form-step']}>
      <Grid container spacing={1} sx={{ m: 0 }}>
        <Grid container direction="row" spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <SoomSwitch
              color="primary"
              isChecked={formik.values.feShowPrintedVersion}
              name="feShowPrintedVersion"
              label="Show Printed Version Form"
              handleOnChange={(event) => {
                formik.setFieldValue('feShowPrintedVersion', event.target.checked);
              }}
            />
          </Grid>
          {/* <Grid item xs={12} sm={6} md={4}>
            <SoomSwitch
              color="primary"
              isChecked={formik.values.feShowRegions}
              name="feShowRegions"
              label="Show Regions"
              handleOnChange={(event) => {
                formik.setFieldValue('feShowRegions', event.target.checked);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SoomSwitch
              color="primary"
              isChecked={formik.values.feShowLanguages}
              name="feShowLanguages"
              label="Show Languages"
              handleOnChange={(event) => {
                formik.setFieldValue('feShowLanguages', event.target.checked);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SoomSwitch
              color="primary"
              isChecked={formik.values.feShowFlags}
              name="feShowFlags"
              label="Show Flags"
              handleOnChange={(event) => {
                formik.setFieldValue('feShowFlags', event.target.checked);
              }}
            />
          </Grid> */}
        </Grid>
      </Grid>
    </div>
  );
};

Visualizations.label = 'Visualizations';

export default Visualizations;
