import React from 'react';
import { Grid, Divider } from '@mui/material';
import { SoomTextField } from '@soom-universe/soom-ui';
import styles from './index.module.scss';

const Information = (props) => {
  const { formik, isAnalyticsAdmin, customDomainEnabled } = props;

  return (
    <div className={styles['form-step']}>
      <Grid container spacing={1} sx={{ m: 0 }}>
        <Grid container direction="row" spacing={3}>
          <Grid item xs={12} md={12}>
            <SoomTextField
              fullWidth
              dataTestId="coSEOTitle"
              ariaLabel="SEO Title"
              id="coSEOTitle"
              name="coSEOTitle"
              variant="outlined"
              label="SEO Title"
              placeholder="Enter a title (name of the Web App site)"
              required={true}
              value={formik.values.coSEOTitle}
              handlerOnChange={formik.handleChange}
              error={formik.touched.coSEOTitle && Boolean(formik.errors.coSEOTitle)}
              helperText={formik.touched.coSEOTitle && formik.errors.coSEOTitle}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <SoomTextField
              fullWidth
              dataTestId="coSEODescription"
              ariaLabel="SEO Description"
              id="coSEODescription"
              name="coSEODescription"
              variant="outlined"
              label="SEO Description"
              placeholder="Enter a description"
              required={true}
              value={formik.values.coSEODescription}
              handlerOnChange={formik.handleChange}
              error={formik.touched.coSEODescription && Boolean(formik.errors.coSEODescription)}
              helperText={formik.touched.coSEODescription && formik.errors.coSEODescription}
            />
          </Grid>
          {customDomainEnabled && (
            <Grid item xs={12} md={12}>
              <SoomTextField
                fullWidth
                dataTestId="coCustomDomain"
                ariaLabel="Custom Domain/Subdomain"
                id="coCustomDomain"
                name="coCustomDomain"
                variant="outlined"
                label="Custom Domain/Subdomain"
                placeholder="Custom Domain/Subdomain e.g. piedpiper.com or ifu.acme.net"
                required={false}
                value={formik.values.coCustomDomain}
                handlerOnChange={formik.handleChange}
                error={formik.touched.coCustomDomain && Boolean(formik.errors.coCustomDomain)}
                helperText={formik.touched.coCustomDomain && formik.errors.coCustomDomain}
              />
            </Grid>
          )}
          <Grid item xs={12} md={12}>
            <SoomTextField
              fullWidth
              dataTestId="coTermsOfUseUrl"
              ariaLabel="coTermsOfUseUrlLabel"
              id="coTermsOfUseUrl"
              name="coTermsOfUseUrl"
              variant="outlined"
              label="Terms of Use URL"
              placeholder="Terms of Use URL e.g. https://example.com/terms-of-use.pdf"
              required={false}
              value={formik.values.coTermsOfUseUrl}
              handlerOnChange={formik.handleChange}
              error={formik.touched.coTermsOfUseUrl && Boolean(formik.errors.coTermsOfUseUrl)}
              helperText={formik.touched.coTermsOfUseUrl && formik.errors.coTermsOfUseUrl}
            />
          </Grid>
        </Grid>
        <Divider orientation="horizontal" flexItem textAlign="center" sx={{ width: '100%', py: 1 }} role="presentation">
          <strong>Analytics</strong>
        </Divider>
        <Grid container direction="row" spacing={3} style={{ marginTop: 0 }}>
          <Grid item xs={12} md={12}>
            <SoomTextField
              fullWidth
              dataTestId="coAnalyticsEmbedCode"
              ariaLabel="coAnalyticsEmbedCodeLabel"
              id="coAnalyticsEmbedCode"
              name="coAnalyticsEmbedCode"
              variant="outlined"
              label="Analytics Embed Code"
              placeholder="Enter the embed code for analytics functionality. E.g. Adobe Analytics"
              multiline
              rows={3}
              value={formik.values.coAnalyticsEmbedCode}
              handlerOnChange={formik.handleChange}
              error={formik.touched.coAnalyticsEmbedCode && Boolean(formik.errors.coAnalyticsEmbedCode)}
              helperText={formik.touched.coAnalyticsEmbedCode && formik.errors.coAnalyticsEmbedCode}
            />
          </Grid>
        </Grid>
        <Grid container direction="row" spacing={3} style={{ marginTop: 0 }}>
          <Grid item xs={12} md={6}>
            <SoomTextField
              fullWidth
              dataTestId="coAnalyticsTagId"
              ariaLabel="coAnalyticsTagIdLabel"
              id="coAnalyticsTagId"
              name="coAnalyticsTagId"
              variant="outlined"
              label="Google Tag Manager ID (starts with GTM)"
              placeholder="Enter an ID"
              value={formik.values.coAnalyticsTagId}
              handlerOnChange={formik.handleChange}
              error={formik.touched.coAnalyticsTagId && Boolean(formik.errors.coAnalyticsTagId)}
              helperText={formik.touched.coAnalyticsTagId && formik.errors.coAnalyticsTagId}
            />
          </Grid>
          {isAnalyticsAdmin && (
            <Grid item xs={12} md={6}>
              <SoomTextField
                fullWidth
                dataTestId="coAnalyticsAdminTagId"
                ariaLabel="coAnalyticsAdminTagIdLabel"
                id="coAnalyticsAdminTagId"
                name="coAnalyticsAdminTagId"
                variant="outlined"
                label="Google Analytics Tracking ID (starts with UA)"
                placeholder="Enter an ID"
                value={formik.values.coAnalyticsAdminTagId}
                handlerOnChange={formik.handleChange}
                error={formik.touched.coAnalyticsAdminTagId && Boolean(formik.errors.coAnalyticsAdminTagId)}
                helperText={formik.touched.coAnalyticsAdminTagId && formik.errors.coAnalyticsAdminTagId}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

Information.label = 'Information';

export default Information;
