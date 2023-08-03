import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import * as React from 'react';
import HeroSimple from '../global/hero-simple';

function LocationsBuilder({ data }) {
  return (
    <Grid container spacing={10} sx={{ backgroundColor: '#FFFFFF', pb: 10, mt: 0 }}>
      {data.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} lg={4} key={`location${index}`}>
          <Card sx={{ maxWidth: 345, margin: 'auto' }}>
            <CardActionArea>
              <CardMedia component="img" height="345" image={item.img} alt={item.name} />
              <CardContent sx={{ height: 100 }}>
                <Typography gutterBottom variant="h5" component="div" color="#000000">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="#000000">
                  {item.role}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default function Locations({ data }) {
  return (
    <Grid container>
      <HeroSimple
        title="Our Global Presence"
        content="With a strategic presence in key locations worldwide, we are able to serve clients seamlessly across borders. Our team is spread across the Americas and Europe, allowing us to provide localized support and tailored solutions to meet the unique needs of our clients in each region."
        color="#000000"
        backgroundColor="#FFFFFF"
      />
      <LocationsBuilder data={data} />
    </Grid>
  );
}
