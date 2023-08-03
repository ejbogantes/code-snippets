import React, { useState } from 'react';
import { get as _get } from 'lodash';

import { Grid, Divider, List, ListItem, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';

import { SoomCard, SoomCardContent, SoomTypography, SoomButton } from '@soom-universe/soom-ui';
import CheckIcon from '@mui/icons-material/Check';
import Collapse from '@mui/material/Collapse';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import styles from './index.module.scss';

const LicenseCard = (props) => {
  const [open, setOpen] = useState<boolean>(false);
  const { license, selected, handleLicenseChange } = props;
  let features = license.licenseFeatures || [];
  const classNameSelected = selected ? styles['license-card-selected'] : '';

  const handleOpen = () => {
    setOpen(!open);
  };

  const items = [...features.slice(5, -1)];
  if (features.length > 5) {
    features = [...features.slice(0, 4)];
  }

  return (
    <SoomCard
      dataTestId={`cardLicense${license.name}`}
      ariaLabel="portal container"
      className={`${styles['soom-portal__card']} ${styles['license-card']} ${classNameSelected}`}
      sx={{ position: 'relative' }}
    >
      <SoomCardContent className={`${styles['license-card-content']}`}>
        <SoomTypography
          variant="h5"
          component="h5"
          text={license.name}
          dataTestId="txt-license-name"
          ariaLabel={license.name}
          align="center"
          bold={true}
        />
        <Divider sx={{ mb: 2, mt: 1 }} />
        <List sx={{ minHeight: '250px' }} disablePadding>
          {features.map((f, i) => {
            const { feature, description } = f;
            return (
              <ListItem alignItems="flex-start" key={`feature${license.license_id}${i}`} disablePadding>
                <ListItemIcon>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText
                  primary={<p style={{ display: 'flex', alignItems: 'center', margin: 0 }}>{feature.name}</p>}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondary={description}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            );
          })}
          {items.length > 0 && (
            <ListItemButton onClick={handleOpen}>
              <ListItemIcon>
                <ReadMoreIcon />
              </ListItemIcon>
              <ListItemText primary={`And ${items.length} more...`} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          )}
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {items.map((item, i) => {
                const {
                  feature: { name },
                  description
                } = item;
                return (
                  <ListItem key={`read_more${license.license_id}${i}`} sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <CheckIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={<p style={{ display: 'flex', alignItems: 'center', margin: 0 }}>{name}</p>}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondary={description}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </List>
        <Divider sx={{ mb: 1 }} />
        <div style={{ textAlign: 'center' }}>
          <SoomButton
            dataTestId="btnSelectLicense"
            ariaLabel="Select"
            label={selected ? 'Selected' : 'Select'}
            variant="contained"
            className={`${styles['license-button']}`}
            size="large"
            fullWidth={true}
            handlerOnClick={() => {
              if (!selected) {
                handleLicenseChange();
              }
            }}
          />
        </div>
      </SoomCardContent>
    </SoomCard>
  );
};

const Licenses = (props) => {
  const { app, formik } = props;

  const licensesList = app.licenses || [];

  const handleLicenseChange = (license) => {
    formik.setFieldValue('license', license);
  };

  const licenseSelectedId = _get(formik.values, 'license.license_id', null);

  return (
    <div className={`${styles['form-step']}`}>
      <Grid container spacing={2} sx={{ pb: 1 }}>
        <Grid item container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={12}>
            <SoomTypography
              variant="h6"
              component="h6"
              text="Select your plan to get started"
              dataTestId="txt-license-name"
              ariaLabel="Select your plan to get started"
            />
            <Divider style={{ paddingBottom: 10 }} />
          </Grid>
        </Grid>

        <Grid item container spacing={2} alignItems="top" justifyContent="left">
          {licensesList.map((license, i) => {
            return (
              <Grid item xs={6} sm={4} md={3} lg={3} key={`license${i}`}>
                <LicenseCard
                  license={license}
                  selected={licenseSelectedId === license.license_id}
                  handleLicenseChange={() => {
                    handleLicenseChange(license);
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </div>
  );
};

export default Licenses;
