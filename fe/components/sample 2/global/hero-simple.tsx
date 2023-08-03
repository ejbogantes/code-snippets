import { Container, Grid, Typography } from '@mui/material';
import * as React from 'react';

export default function HeroSimple({ title, content, color, backgroundColor }) {
  return (
    <Grid item xs={12} textAlign={'center'} sx={{ backgroundColor: backgroundColor }}>
      <Container disableGutters sx={{ width: '100%', px: [1, 10, 10, 15] }}>
        <Typography variant="h4" gutterBottom fontWeight={'bold'} color={color}>
          {title}
        </Typography>
        <Typography variant="h5" gutterBottom color={color}>
          {content}
        </Typography>
      </Container>
    </Grid>
  );
}
