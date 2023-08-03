import { Grid } from '@mui/material';
import * as React from 'react';
import HeroSimple from '../global/hero-simple';
import Image from 'next/image';
import Link from 'next/link';

const imageLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

function ClientsBuilder({ data }) {
  return (
    <Grid
      container
      sx={{
        backgroundColor: '#FFFFFF',
        px: [2, 2, 5, 5, 30],
        py: 10,
        width: '100%'
      }}>
      {data.map((item, index) => (
        <Grid key={`client${index}`} item xs={12} sm={6} md={4} lg={3} justifyContent={'center'} textAlign={'center'}>
          <Link href={item.link} target="_blank" rel="noopener">
            <Image loader={imageLoader} src={item.logo} alt={item.name} width={275} height={275} />
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}

export default function Clients({ content }) {
  return (
    <Grid container rowSpacing={1} sx={{ width: '100%', backgroundColor: '#FFFFFF' }}>
      <HeroSimple title={content.title} content={content.description} color="#000000" backgroundColor="#FFFFFF" />
      <ClientsBuilder data={content.data} />
    </Grid>
  );
}
