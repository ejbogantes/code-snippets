import React from 'react';

// mui
import {
  Grid,
  FormControl,
  FormControlLabel,
  FormHelperText,
  TextField,
  Checkbox,
  Typography,
  Link,
  Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

export default function ContactForm({ formik, alertState }) {
  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid item md={12} xs={12}>
          <TextField
            data-test-id="company"
            aria-label="companyLabel"
            fullWidth
            variant="outlined"
            label="Company Name"
            placeholder="Please enter a company name"
            name="company"
            required
            value={formik.values.company}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.company && Boolean(formik.errors.company)}
            helperText={formik.touched.company && formik.errors.company}
            disabled={formik.isSubmitting}
          />
        </Grid>

        <Grid item md={12} xs={12}>
          <TextField
            data-test-id="name"
            aria-label="nameLabel"
            fullWidth
            variant="outlined"
            label="Name"
            placeholder="Please enter a name"
            name="name"
            required
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            disabled={formik.isSubmitting}
          />
        </Grid>

        <Grid item md={12} xs={12}>
          <TextField
            data-test-id="phone"
            aria-label="phoneLabel"
            fullWidth
            variant="outlined"
            label="Phone"
            placeholder="Please enter a phone"
            name="phone"
            required
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
            disabled={formik.isSubmitting}
          />
        </Grid>

        <Grid item md={12} xs={12}>
          <TextField
            data-test-id="email"
            aria-label="emailLabel"
            fullWidth
            variant="outlined"
            label="Email"
            placeholder="Please enter a email"
            name="email"
            required
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={formik.isSubmitting}
          />
        </Grid>

        <Grid item md={12} xs={12}>
          <TextField
            data-test-id="message"
            aria-label="messageLabel"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            label="Message"
            placeholder="Please enter a message"
            name="message"
            required
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.message && Boolean(formik.errors.message)}
            helperText={formik.touched.message && formik.errors.message}
            disabled={formik.isSubmitting}
          />
        </Grid>

        <Grid item md={12} xs={12}>
          <FormControl error={formik.touched.consent && Boolean(formik.errors.consent)}>
            <FormControlLabel
              control={
                <Checkbox
                  size="medium"
                  checked={formik.values.consent}
                  onChange={(event, checked) => {
                    formik.setFieldValue('consent', checked);
                  }}
                  onBlur={() => {
                    formik.setFieldTouched('consent', true);
                  }}
                />
              }
              labelPlacement="end"
              label="I consent to Soom Inc collecting and storing my data from this form."
            />
            {formik.touched.consent && Boolean(formik.errors.consent) ? (
              <FormHelperText>{formik.touched.consent && formik.errors.consent}</FormHelperText>
            ) : null}
          </FormControl>
        </Grid>

        <Grid item md={12} xs={12}>
          <Typography>
            To opt-out, access, or correct personal information, refer to the{' '}
            <Link color="inherit" href="/privacy-policy" target="_blank" rel="noopener">
              Soom Privacy Policy
            </Link>
            .
          </Typography>
        </Grid>

        {alertState.open && (
          <Grid item md={12} xs={12}>
            <Alert severity={alertState.success ? 'success' : 'error'}>{alertState.message}</Alert>
          </Grid>
        )}

        <Grid item md={12} xs={12} sx={{ textAlign: 'center' }}>
          <LoadingButton
            variant="contained"
            color="secondary"
            type="submit"
            onClick={() => {
              formik.handleSubmit();
            }}
            loading={formik.isSubmitting}
            disabled={!(formik.isValid && formik.dirty)}>
            Submit
          </LoadingButton>
        </Grid>
      </Grid>
    </form>
  );
}
