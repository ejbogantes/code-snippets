import { Container, Grid, Paper, Typography } from '@mui/material';
import * as React from 'react';

export default function Hero({ content }) {
  return (
    <Container disableGutters maxWidth={false}>
      <Grid
        container
        sx={{
          paddingX: 7.5,
          paddingBottom: 10,
          paddingTop: [12, 16, 14, 20],
          backgroundImage: `url('${content.backgroundImage}')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          height: '100vh',
          width: '100%'
        }}>
        <Grid item xs={12} sm={8} md={8} lg={6} xl={4}>
          <Typography
            variant="h3"
            component={'h1'}
            gutterBottom
            fontWeight={'bold'}
            color={'#FFFFFF'}
            style={{
              textShadow: '2px 1px 1px #000000'
            }}>
            {content.title1}
            <br></br>
            <br></br>
            {content.title2}
          </Typography>
          <br></br>
          <Paper
            elevation={4}
            sx={{
              background: '#7777'
            }}>
            <Typography
              variant="h5"
              gutterBottom
              color={'#FFFFFF'}
              style={{
                padding: 15,
                textShadow: '2px 2px 2px #000'
              }}>
              {content.text}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
