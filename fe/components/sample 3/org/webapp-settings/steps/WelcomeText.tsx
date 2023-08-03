import React from 'react';
import { Grid, Typography, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { SoomTextField } from '@soom-universe/soom-ui';
import styles from './index.module.scss';

const WelcomeText = (props) => {
  const { formik, languages, customizeWelcomeText, setCustomizeWelcomeText } = props;

  return (
    <div className={styles['form-step']}>
      <Grid container spacing={1} sx={{ m: 0 }}>
        <Grid container direction="row" spacing={3}>
          <Grid item xs={12} style={{ paddingBottom: '24px' }}>
            <FormControl>
              <RadioGroup row aria-labelledby="demo-row-radio-buttons-group-label" name="row-radio-buttons-group">
                <FormControlLabel
                  control={<Radio />}
                  label={`Use the default welcome text`}
                  name="customizeWelcomeTextSelection"
                  onChange={() => {
                    setCustomizeWelcomeText(false);
                  }}
                  checked={!customizeWelcomeText}
                />
                <FormControlLabel
                  control={<Radio />}
                  label={`Customize the welcome text`}
                  name="customizeWelcomeTextSelection"
                  onChange={() => {
                    setCustomizeWelcomeText(true);
                  }}
                  checked={customizeWelcomeText}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        {customizeWelcomeText && (
          <Grid container direction="row" spacing={3} sx={{ maxHeight: '450px', overflow: 'auto', mt: 0 }}>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <Typography variant="body2">
                In each welcome text field, you can use variables to replace with configuration values in the Web App
                and HTML tags.
              </Typography>
              <Typography variant="body2">
                <strong>Available variables:</strong> email (Notifications email), phone (Phone number).
              </Typography>
              <Typography variant="body2">
                <strong>Example:</strong> This is the welcome text using variables and HTML tags{' '}
                {'{{ email }} {{ phone }} <b>Bold Tag</b> <i>Italic Tag</i> <a href="https://example.com">Link Tag</a>'}
                .
              </Typography>
            </Grid>
            {languages.map((langObj) => {
              const langIndex = `lang_${langObj.value}`;
              return (
                <Grid item xs={12} key={`langInput${langObj.value}`}>
                  <SoomTextField
                    fullWidth
                    multiline
                    rows={3}
                    dataTestId={langIndex}
                    ariaLabel={`${langIndex}Label`}
                    id={langIndex}
                    name={langIndex}
                    variant="outlined"
                    label={langObj.label}
                    placeholder="Enter a Welcome Text"
                    required={true}
                    value={formik.values[langIndex]}
                    handlerOnChange={formik.handleChange}
                    error={formik.touched[langIndex] && Boolean(formik.errors[langIndex])}
                    helperText={formik.touched[langIndex] && formik.errors[langIndex]}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

WelcomeText.label = 'Welcome Text';

export default WelcomeText;
