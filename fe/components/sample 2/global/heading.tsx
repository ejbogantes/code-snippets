import { Grid, Paper, Typography } from '@mui/material';
import * as React from 'react';

export default function Heading({ title, content, image, ...optionalProps }) {
  return (
    <Grid
      className={optionalProps.darkenImage ? 'heading' : ''}
      container
      sx={{
        position: 'relative',
        px: [5, 0, 0, 0],
        pt: 15,
        pb: 10,
        backgroundImage: `url('${image}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}>
      <Grid item xs={0} sm={2} md={3} lg={4}></Grid>
      <Grid
        item
        xs={12}
        sm={8}
        md={6}
        lg={4}
        textAlign="center"
        sx={{
          position: 'relative'
        }}>
        <Typography variant="h3" fontWeight={'bold'} color={'#FFFFFF'} style={{ textShadow: '2px 1px 1px #000000' }}>
          {title}
        </Typography>
        <br />
        <Paper elevation={4} sx={{ background: '#5557' }}>
          <Typography variant="h5" color={'#FFFFFF'} style={{ padding: 15, textShadow: '2px 2px 2px #000000' }}>
            {content}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
