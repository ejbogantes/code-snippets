import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import * as React from 'react';
import HeroSimple from '../global/hero-simple';

function TeamBuilder({ data }) {
  return (
    <Grid container spacing={10} sx={{ backgroundColor: '#FFFFFF', pb: 10, mt: 0 }}>
      {data.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={`team${index}`}>
          <Card sx={{ maxWidth: 345, margin: 'auto' }}>
            <CardActionArea>
              <CardMedia component="img" height="400" image={item.img} alt={item.name} />
              <CardContent sx={{ height: 100 }}>
                <Typography gutterBottom variant="h5" component="div" color="#000000">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="#000000">
                  {item.role}
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button size="small" color="primary" href={item.linkedin} target="_blank" rel="noopener">
                Go to LinkedIn Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default function Team({ data }) {
  return (
    <Grid container>
      <HeroSimple
        title="Our Team"
        content="Our team comprises a group of highly experienced professionals who bring a wealth of expertise and industry knowledge to the table. With their years of collective experience, they are well-equipped to tackle diverse challenges and provide innovative solutions for our clients."
        color="#000000"
        backgroundColor="#FFFFFF"
      />
      <TeamBuilder data={data} />
    </Grid>
  );
}
