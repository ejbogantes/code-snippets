import * as React from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Container, Grid, Typography, Link, Stack } from '@mui/material';

import footer from '../../content/menu.json';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'©'}
      {new Date().getFullYear()}{' '}
      <Link color="inherit" href="https://www.soom.com">
        Soom, Inc.
      </Link>
      {' All Rights Reserved.'}
    </Typography>
  );
}

export default function Footer() {
  const footers = footer.footer;
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        backgroundColor: '#FFFFFF',
        px: [5, 5, 10, 10],
        width: '100%'
      }}>
      <Container
        maxWidth="xl"
        component="footer"
        sx={{
          background: '#FFFFFF',
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          mt: 0,
          py: [3, 6]
        }}>
        <Grid container spacing={4} justifyContent="space-evenly">
          {footers.map((footer) => (
            <Grid item xs={12} sm={6} md={3} key={footer.title}>
              <Typography variant="h6" color="#000000" gutterBottom>
                {footer.title}
              </Typography>
              <ul>
                {footer.description.map((item, i) => (
                  <li key={item.label}>
                    <Link href={item.link} variant="subtitle1" color="text.secondary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={1} mt={[5, 0]}>
          <Link href="https://www.linkedin.com/company/soominc" style={{ color: '#444444' }}>
            <LinkedInIcon />
          </Link>
          <Link href="https://www.facebook.com/SoomIncorporated" style={{ color: '#444444' }}>
            <FacebookIcon />
          </Link>
          <Link href="https://www.youtube.com/@soominc.1750" style={{ color: '#444444' }}>
            <YouTubeIcon />
          </Link>
        </Stack>
        <Copyright sx={{ mt: 15 }} />
      </Container>
    </Container>
  );
}
