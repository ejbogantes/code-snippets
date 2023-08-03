import React from 'react';
import { get as _get } from 'lodash';

import {
  Grid,
  List,
  ListItem,
  ListItemText,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider
} from '@mui/material';

import { SoomTypography, SoomTextField, SoomSelect } from '@soom-universe/soom-ui';

import CircleIcon from '@mui/icons-material/Circle';

import styles from './index.module.scss';

function splitIntoChunk(arr, chunkSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const tempArray = arr.slice(i, i + chunkSize);
    result.push(tempArray);
  }
  return result;
}

const Summary = (props) => {
  const { profile, app, organizations, formik } = props;

  const organizationsList = organizations
    ? organizations.map((item) => ({ label: item.name, value: item.organization_id + '' }))
    : [];
  const licenseSelectedName = _get(formik.values, 'license.name', '') || '';
  const features = _get(formik.values, 'license.licenseFeatures', []) || [];
  // const periodicity = _get(formik.values, 'license.licensePeriodicity[0]', null) || null;

  // let priceLabel = `Price: `;
  // if (periodicity) {
  //   priceLabel += periodicity.price_label.charAt(0).toUpperCase() + periodicity.price_label.slice(1);
  //   if (periodicity.price !== 0) {
  //     priceLabel += ` (`;
  //     priceLabel += periodicity.periodicity_label.charAt(0).toUpperCase() + periodicity.periodicity_label.slice(1);
  //     priceLabel += `)`;
  //   }
  // }

  let featuresNumColumns = 1;
  if (features.length > 15) {
    featuresNumColumns = 4;
  } else if (features.length > 10) {
    featuresNumColumns = 3;
  } else if (features.length > 5) {
    featuresNumColumns = 2;
  }
  const chunksSize = Math.ceil(features.length / featuresNumColumns);

  const featuresChunks = splitIntoChunk(features, chunksSize);

  return (
    <div className={`${styles['form-step']}`}>
      <Grid container spacing={2} sx={{ pb: 5 }}>
        <Grid item container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sx={{ pr: '16px' }}>
            <SoomTypography
              variant="h6"
              component="h6"
              text="Summary"
              dataTestId="txt-license-name"
              ariaLabel="Summary"
              bold={true}
            />
            <Divider style={{ paddingTop: 3 }} />
          </Grid>
          {/* <Grid item xs={6} sx={{ pr: '16px' }}>
            <SoomTypography
              variant="h5"
              component="h5"
              text={priceLabel}
              dataTestId="txt-license-name"
              ariaLabel={priceLabel}
              align="right"
            />
          </Grid> */}
        </Grid>
        <Grid item container spacing={1}>
          <Grid item xs={12} sx={{ pr: '16px' }}>
            <SoomTypography
              variant="body2"
              component="span"
              text={`Hi ${profile.first_name}, you selected our ${licenseSelectedName} license. Look at what is in the box: `}
              dataTestId="txt-license-name"
              ariaLabel={`Hi ${profile.first_name}, you selected our ${licenseSelectedName} license. Look at what is in the box: `}
            />

            <Grid item container spacing={1} sx={{ mt: 1 }}>
              {featuresChunks.map((chunk, i) => {
                return (
                  <Grid item xs={12} md={6} lg={3} key={`featuresChunks${i}`}>
                    <List disablePadding>
                      {chunk.map((f, i) => {
                        const { feature } = f;
                        return (
                          <ListItem key={`selectedFeature${i}`} disablePadding>
                            <ListItemText
                              primary={
                                <p style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                                  <CircleIcon sx={{ fontSize: '6px', mr: '5px' }} /> {feature.name}
                                </p>
                              }
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondary={feature.description}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Grid>
                );
              })}
            </Grid>

            <Grid item container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={12}>
                <SoomTypography
                  variant="h6"
                  component="h6"
                  text="Organization details"
                  dataTestId="txt-license-name"
                  ariaLabel="Organization details"
                  bold={true}
                />
                <Divider style={{ paddingTop: 3 }} />
              </Grid>

              <Grid item xs={12} md={12}>
                <FormControl>
                  <RadioGroup row aria-labelledby="demo-row-radio-buttons-group-label" name="row-radio-buttons-group">
                    <FormControlLabel
                      value="1"
                      control={<Radio />}
                      label={`Existing organization without ${app.name} ${licenseSelectedName} license`}
                      name="orgSelection"
                      onChange={formik.handleChange}
                      checked={formik.values.orgSelection === '1'}
                      disabled={organizationsList.length <= 0}
                    />
                    <FormControlLabel
                      value="2"
                      control={<Radio />}
                      label={`New organization`}
                      name="orgSelection"
                      onChange={formik.handleChange}
                      checked={formik.values.orgSelection === '2'}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {formik.values.orgSelection === '1' && (
                <Grid item xs={12} md={6}>
                  <SoomSelect
                    dataTestId="orgId"
                    ariaLabel="Existing organization"
                    required={true}
                    options={organizationsList}
                    id="orgId"
                    name="orgId"
                    label="Existing organization"
                    labelId="orgIdLabel"
                    value={formik.values.orgId}
                    onChange={formik.handleChange}
                    error={formik.touched.orgId && Boolean(formik.errors.orgId)}
                    textError={formik.touched.orgId && formik.errors.orgId ? String(formik.errors.orgId) : undefined}
                  />
                </Grid>
              )}

              {formik.values.orgSelection === '2' && (
                <Grid item xs={12} md={6}>
                  <SoomTextField
                    fullWidth
                    dataTestId="orgName"
                    ariaLabel="Organization name"
                    id="orgName"
                    name="orgName"
                    variant="outlined"
                    label="Organization name"
                    placeholder="Enter a title (name of the Web App site)"
                    required={true}
                    value={formik.values.orgName}
                    handlerOnChange={formik.handleChange}
                    error={formik.touched.orgName && Boolean(formik.errors.orgName)}
                    helperText={formik.touched.orgName && formik.errors.orgName}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Summary;
