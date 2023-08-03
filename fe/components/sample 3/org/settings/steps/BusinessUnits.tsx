import styles from './index.module.scss';

import React from 'react';

// material ui components
import { Box, IconButton, Stack, Typography, Grid } from '@mui/material';

import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';

import { DataGrid, GridColDef, GridColumnHeaderParams, GridRenderCellParams } from '@mui/x-data-grid';

import { SoomButton } from '@soom-universe/soom-ui';

const BusinessUnits = (props) => {
  const { loadingBUData, BUData, handleDeleteBUClickOpen, handleBUFormClickOpen, formBULoading } = props;

  // documents data
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 500,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Name'}</strong>
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
                handleBUFormClickOpen(params.row.business_unit_id, params.row.name);
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              aria-label="delete"
              color="primary"
              size="small"
              onClick={() => {
                handleDeleteBUClickOpen(params.row.business_unit_id, params.row.name);
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
                    handleBUFormClickOpen();
                  }}
                  label={
                    <>
                      <AddIcon sx={{ verticalAlign: 'middle' }} /> Create Business Unit
                    </>
                  }
                  type="button"
                  disabled={formBULoading}
                />
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ width: '100%' }}>
              <DataGrid
                aria-label="business-units"
                loading={loadingBUData}
                rows={BUData}
                columns={columns}
                autoHeight
                hideFooterPagination
                checkboxSelection={false}
                disableSelectionOnClick
                disableColumnMenu
                density="compact"
                getRowId={(row) => row.business_unit_id}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

BusinessUnits.label = 'Business Units';

export default BusinessUnits;
