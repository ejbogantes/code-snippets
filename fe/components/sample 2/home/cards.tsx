import { Card, CardContent, CardMedia, Container, Grid, Typography } from '@mui/material';
import * as React from 'react';

function CardsBuilder({ data }) {
  return (
    <Grid
      container
      spacing={[5, 10]}
      sx={{
        backgroundColor: '#FFFFFF',
        px: [2, 2, 5, 5, 30],
        py: 10
      }}>
      {data.map((item, index) => (
        <Grid key={`solution${index}`} item xs={12} sm={12} md={4} sx={{ textAlign: 'center' }}>
          <Card sx={{ maxWidth: ['auto', 'auto', 345] }}>
            <CardMedia sx={{ height: ['75vh', '60vh', 175] }} image={item.image} title={item.title} />
            <CardContent sx={{ height: [115, 125, 175] }}>
              <Typography gutterBottom variant="h5" component="div" color="#000000">
                {item.title}
              </Typography>
              <Typography variant="body2" color="#000000">
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default function Cards({ content }) {
  return (
    <Container disableGutters maxWidth={false} sx={{ width: '100%' }}>
      <Grid container sx={{ backgroundColor: '#FFFFFF' }}>
        <Grid
          item
          xs={12}
          textAlign={'center'}
          sx={{
            py: 10,
            px: [1, 10, 10, 15],
            background: '#fbb042',
            mb: 2
          }}>
          <Container disableGutters>
            <Typography component={'h2'} variant="h4" gutterBottom fontWeight={'bold'} color="#000000">
              {content.title}
            </Typography>
            <Typography variant="h5" gutterBottom color="primary">
              {content.subtitle}
            </Typography>
          </Container>
        </Grid>
      </Grid>
      <CardsBuilder data={content.data} />
    </Container>
  );
}
