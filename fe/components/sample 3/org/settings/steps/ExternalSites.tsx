import styles from './index.module.scss';

import React from 'react';

// material ui components
import { Box, IconButton, Stack, Typography, Grid } from '@mui/material';

import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';

import { DataGrid, GridColDef, GridColumnHeaderParams, GridRenderCellParams } from '@mui/x-data-grid';

import { SoomButton } from '@soom-universe/soom-ui';

const ExternalSites = (props) => {
  const { loadingESData, ESData, handleDeleteESClickOpen, handleESFormClickOpen, formESLoading } = props;

  // documents data
  const columns: GridColDef[] = [
    {
      field: 'url',
      headerName: 'URL',
      width: 300,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'URL'}</strong>
    },
    {
      field: 'regions',
      headerName: 'Regions',
      width: 300,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Regions'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return params.value.split(',').join(', ');
      }
    },
    {
      field: '',
      type: 'actions',
      headerName: '',
      headerAlign: 'center',
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <>
            <IconButton
              aria-label="delete"
              color="primary"
              size="small"
              onClick={() => {
                handleESFormClickOpen(params.row);
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              aria-label="delete"
              color="primary"
              size="small"
              onClick={() => {
                handleDeleteESClickOpen(params.row.external_site_id, params.row.url);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </>
        );
      }
    }
  ];

  return (
    <div className={styles['form-step']}>
      <Grid container spacing={1} sx={{ m: 0 }}>
        <Grid container direction="row" spacing={3}>
          <Grid item xs={12} md={12}>
            <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1}>
              <Typography variant="body1" component="p">
                <SoomButton
                  dataTestId="btnNo"
                  ariaLabel="btnNo"
                  variant="contained"
                  handlerOnClick={() => {
                    handleESFormClickOpen();
                  }}
                  label={
                    <>
                      <AddIcon sx={{ verticalAlign: 'middle' }} /> Create Redirect
                    </>
                  }
                  type="button"
                  disabled={formESLoading}
                />
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ width: '100%' }}>
              <DataGrid
                aria-label="business-units"
                loading={loadingESData}
                rows={ESData}
                columns={columns}
                autoHeight
                hideFooterPagination
                checkboxSelection={false}
                disableSelectionOnClick
                disableColumnMenu
                density="compact"
                getRowId={(row) => row.external_site_id}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

ExternalSites.label = 'Redirect Set Up';

export default ExternalSites;
