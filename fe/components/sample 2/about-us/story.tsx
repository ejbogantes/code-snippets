import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import HeroSimple from '../global/hero-simple';

export default function Story(props) {
  const { content } = props;

  return (
    <Grid container sx={{ pb: 10 }}>
      <HeroSimple
        title="Our Story"
        content="Soom bridges the information gaps between data sources and physical products by using semantic search and augmented data management."
        color="#000000"
        backgroundColor="#FFFFFF"
      />
      {content.map((item, index) => (
        <Typography variant="h6" component="span" gutterBottom textAlign="justify" whiteSpace="pre-wrap" key={index}>
          {item.text}
        </Typography>
      ))}
    </Grid>
  );
}
