import { Container, Grid, Typography, CircularProgress } from '@mui/material';
import {
  VaccinesOutlined as VaccinesIcon,
  PrecisionManufacturingOutlined as PrecisionManufacturingIcon,
  DescriptionOutlined as DescriptionIcon,
  UpdateOutlined as UpdateIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import * as React from 'react';

const icons = {
  VaccinesIcon,
  PrecisionManufacturingIcon,
  DescriptionIcon,
  UpdateIcon
};

function abbreviateNumber(value) {
  if (value < 1e3) return value;
  if (value >= 1e3 && value < 1e6) return +(value / 1e3).toFixed(1) + 'K';
  if (value >= 1e6 && value < 1e9) return +(value / 1e6).toFixed(1) + 'M';
  if (value >= 1e9 && value < 1e12) return +(value / 1e9).toFixed(1) + 'B';
  if (value >= 1e12) return +(value / 1e12).toFixed(1) + 'T';
}

export default function Stats({ content, stats, loading }) {
  return (
    <Container disableGutters maxWidth={false} sx={{ width: '100%' }}>
      <Grid
        container
        spacing={1}
        sx={{
          backgroundColor: '#FFFFFF',
          px: [1, 1, 1, 10, 20],
          py: 3
        }}>
        {content.data.map((item) => {
          const Icon = icons[item.icon] || InfoIcon;
          const value = stats[item.dataIndex] || 0;

          return (
            <Grid
              key={item.label}
              item
              xs={12}
              sm={6}
              md={3}
              style={{ padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ marginRight: '10px', height: '100%', display: 'inline-flex', alignItems: 'center' }}>
                <Icon color="primary" sx={{ fontSize: '5rem' }} />
              </div>
              <div>
                <Typography variant="h3" color="secondary">
                  {loading ? (
                    <CircularProgress color="secondary" size={45} />
                  ) : (
                    <strong>{abbreviateNumber(value)}</strong>
                  )}
                </Typography>
                <Typography variant="h4" color="primary">
                  {item.label}
                </Typography>
              </div>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
