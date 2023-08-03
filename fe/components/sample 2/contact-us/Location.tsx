import React from 'react';

import { Grid, Typography, Button, Divider } from '@mui/material';

import {
  Phone as PhoneIcon,
  Place as PlaceIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';

export default function Location({ title, phone, location, locationUrl, showDivider }) {
  return (
    <Grid container>
      <Grid item md={12} xs={12}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ display: 'flex', mb: 1 }}>
          <PhoneIcon color="secondary" sx={{ mr: 1 }} /> {phone}
        </Typography>
        <Typography color="text.secondary" sx={{ display: 'flex', mb: 1 }}>
          <PlaceIcon color="secondary" sx={{ mr: 1 }} /> {location}
        </Typography>
        <Button href={locationUrl} target="_blank">
          Get Directions <KeyboardArrowRightIcon color="secondary" sx={{ ml: 1 }} />
        </Button>
        {showDivider && <Divider sx={{ my: 3 }} />}
      </Grid>
    </Grid>
  );
}
