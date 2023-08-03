import React from 'react';
import parse from 'html-react-parser';

import { Grid, Card, CardMedia, CardContent, CardActions, Typography, Button, Link } from '@mui/material';

export default function Item({ item }) {
  const link = `/blog/${item.slug}`;
  return (
    <Grid item xs={12} sm={6} md={6} lg={6} sx={{ pb: 1 }}>
      <Card>
        {item.featuredImage && (
          <Link href={link}>
            <CardMedia
              component="img"
              height="200"
              image={item.featuredImage.sourceUrl}
              alt={item.featuredImage.altText !== '' ? item.featuredImage.altText : 'Blog Item Image'}
              sx={{ cursor: 'pointer' }}
            />
          </Link>
        )}
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {item.title}
          </Typography>
          <Typography variant="body2" component="div" color="text.secondary">
            {parse(item.excerpt)}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button size="small" href={link}>
            Read More
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
}
