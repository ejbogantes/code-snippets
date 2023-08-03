import React from 'react';
import { Grid, Divider } from '@mui/material';
import { SoomColorPicker } from '@soom-universe/soom-ui';
import styles from './index.module.scss';

const Branding = (props) => {
  const { formik } = props;
  return (
    <div className={styles['form-step']}>
      <Grid container spacing={1} sx={{ m: 0 }}>
        <Divider orientation="horizontal" flexItem sx={{ width: '100%', py: 1 }}>
          <strong>Main Colors</strong>
        </Divider>
        <Grid container item spacing={3}>
          <Grid item xs={12} md={6}>
            <SoomColorPicker
              name="thPrimaryColor"
              label="Primary Color"
              value={formik.values.thPrimaryColor}
              onChange={(value) => {
                formik.setFieldValue('thPrimaryColor', value);
              }}
              error={formik.touched.thPrimaryColor && Boolean(formik.errors.thPrimaryColor)}
              errorText={formik.touched.thPrimaryColor && formik.errors.thPrimaryColor}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SoomColorPicker
              name="thPrimaryTextColor"
              label="Primary Text Color"
              value={formik.values.thPrimaryTextColor}
              onChange={(value) => {
                formik.setFieldValue('thPrimaryTextColor', value);
              }}
              error={formik.touched.thPrimaryTextColor && Boolean(formik.errors.thPrimaryTextColor)}
              errorText={formik.touched.thPrimaryTextColor && formik.errors.thPrimaryTextColor}
            />
          </Grid>
        </Grid>
        <Divider orientation="horizontal" flexItem sx={{ width: '100%', py: 1 }}>
          <strong>Footer Colors</strong>
        </Divider>
        <Grid container item spacing={3}>
          <Grid item xs={12} md={6}>
            <SoomColorPicker
              name="thFooterBackgroundColor"
              label="Footer Background Color"
              value={formik.values.thFooterBackgroundColor}
              onChange={(value) => {
                formik.setFieldValue('thFooterBackgroundColor', value);
              }}
              error={formik.touched.thFooterBackgroundColor && Boolean(formik.errors.thFooterBackgroundColor)}
              errorText={formik.touched.thFooterBackgroundColor && formik.errors.thFooterBackgroundColor}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SoomColorPicker
              name="thFooterTextColor"
              label="Footer Text Color"
              value={formik.values.thFooterTextColor}
              onChange={(value) => {
                formik.setFieldValue('thFooterTextColor', value);
              }}
              error={formik.touched.thFooterTextColor && Boolean(formik.errors.thFooterTextColor)}
              errorText={formik.touched.thFooterTextColor && formik.errors.thFooterTextColor}
            />
          </Grid>
        </Grid>
        <Divider orientation="horizontal" flexItem sx={{ width: '100%', py: 1 }}>
          <strong>GDPR Colors</strong>
        </Divider>
        <Grid container item spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <SoomColorPicker
              name="thGdprBackgroundColor"
              label="GDPR Background Color"
              value={formik.values.thGdprBackgroundColor}
              onChange={(value) => {
                formik.setFieldValue('thGdprBackgroundColor', value);
              }}
              error={formik.touched.thGdprBackgroundColor && Boolean(formik.errors.thGdprBackgroundColor)}
              errorText={formik.touched.thGdprBackgroundColor && formik.errors.thGdprBackgroundColor}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SoomColorPicker
              name="thGdprTextColor"
              label="GDPR Text Color"
              value={formik.values.thGdprTextColor}
              onChange={(value) => {
                formik.setFieldValue('thGdprTextColor', value);
              }}
              error={formik.touched.thGdprTextColor && Boolean(formik.errors.thGdprTextColor)}
              errorText={formik.touched.thGdprTextColor && formik.errors.thGdprTextColor}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SoomColorPicker
              name="thGdprAcceptBtnColor"
              label="GDPR Accept Button Color"
              value={formik.values.thGdprAcceptBtnColor}
              onChange={(value) => {
                formik.setFieldValue('thGdprAcceptBtnColor', value);
              }}
              error={formik.touched.thGdprAcceptBtnColor && Boolean(formik.errors.thGdprAcceptBtnColor)}
              errorText={formik.touched.thGdprAcceptBtnColor && formik.errors.thGdprAcceptBtnColor}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SoomColorPicker
              name="thGdprAcceptBtnTextColor"
              label="GDPR Accept Button Text Color"
              value={formik.values.thGdprAcceptBtnTextColor}
              onChange={(value) => {
                formik.setFieldValue('thGdprAcceptBtnTextColor', value);
              }}
              error={formik.touched.thGdprAcceptBtnTextColor && Boolean(formik.errors.thGdprAcceptBtnTextColor)}
              errorText={formik.touched.thGdprAcceptBtnTextColor && formik.errors.thGdprAcceptBtnTextColor}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SoomColorPicker
              name="thGdprDeclineBtnColor"
              label="GDPR Decline Button Color"
              value={formik.values.thGdprDeclineBtnColor}
              onChange={(value) => {
                formik.setFieldValue('thGdprDeclineBtnColor', value);
              }}
              error={formik.touched.thGdprDeclineBtnColor && Boolean(formik.errors.thGdprDeclineBtnColor)}
              errorText={formik.touched.thGdprDeclineBtnColor && formik.errors.thGdprDeclineBtnColor}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SoomColorPicker
              name="thGdprDeclineBtnTextColor"
              label="GDPR Decline Button Text Color"
              value={formik.values.thGdprDeclineBtnTextColor}
              onChange={(value) => {
                formik.setFieldValue('thGdprDeclineBtnTextColor', value);
              }}
              error={formik.touched.thGdprDeclineBtnTextColor && Boolean(formik.errors.thGdprDeclineBtnTextColor)}
              errorText={formik.touched.thGdprDeclineBtnTextColor && formik.errors.thGdprDeclineBtnTextColor}
            />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

Branding.label = 'Branding';

export default Branding;
