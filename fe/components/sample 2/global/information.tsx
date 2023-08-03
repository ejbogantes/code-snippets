import * as React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import Image from 'next/image';

export default function Information(props) {
  const { invertTextPosition, title, text, img } = props;

  if (invertTextPosition) {
    return (
      <Grid container sx={{ pb: 10 }}>
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          sx={{
            pr: [0, 0, 2, 5],
            pt: [2, 2, 0, 0],
            display: { xs: 'none', sm: 'none', md: 'inline-flex' },
            justifyContent: 'center'
          }}>
          <img src={img} alt={title} style={{ maxWidth: '100%', margin: 'auto' }} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} sx={{ pl: [0, 0, 2, 5] }}>
          <Typography variant="h4" gutterBottom fontWeight={'bold'}>
            {title}
          </Typography>
          <Typography variant="h5" component="span" gutterBottom textAlign="justify" whiteSpace="pre-wrap">
            {text}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          sx={{
            pl: [0, 0, 2, 5],
            pt: [2, 2, 0, 0],
            display: { xs: 'inline-flex', sm: 'inline-flex', md: 'none' },
            justifyContent: 'center'
          }}>
          <img src={img} alt={title} style={{ maxWidth: '100%', margin: 'auto' }} />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container sx={{ pb: 10 }}>
      <Grid item xs={12} sm={12} md={6} sx={{ pr: [0, 0, 2, 5] }}>
        <Typography variant="h4" gutterBottom fontWeight={'bold'}>
          {title}
        </Typography>
        <Typography variant="h5" component="span" gutterBottom textAlign="justify" whiteSpace="pre-wrap">
          {text}
        </Typography>
      </Grid>
      <Grid
        item
        xs={12}
        sm={12}
        md={6}
        sx={{ pl: [0, 0, 2, 5], pt: [2, 2, 0, 0], display: 'inline-flex', justifyContent: 'center' }}>
        <img src={img} alt={title} style={{ maxWidth: '100%', margin: 'auto' }} />
      </Grid>
    </Grid>
  );
}
