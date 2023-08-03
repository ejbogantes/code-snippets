/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
// react and next
import React from 'react';

// material ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import {
  DataGridPremium,
  GridRenderCellParams,
  GridColDef,
  GridRowHeightParams,
  GridColumnHeaderParams
} from '@mui/x-data-grid-premium';

// icons
import PendingIcon from '@mui/icons-material/Pending';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// yup and others
import { object } from 'yup';
import styles from '../../bulk-upload/index.module.scss';

const Submit = ({ rows }) => {
  const columns: GridColDef[] = [
    {
      field: 'fileName',
      headerName: 'File name',
      width: 250,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'File name'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        const color = params.row.status ? '#1976D1' : 'red';
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom sx={{ color }}>
              {params.value}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'brandName',
      headerName: 'Brand name',
      width: 350,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Brand name'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'alternateBrandName',
      headerName: 'Alternate brand name',
      width: 350,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Alternate brand name'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (params.value && params.value !== '') {
          return (
            <Box component="div" whiteSpace="normal">
              <Typography variant="body2" gutterBottom>
                {params.value}
              </Typography>
            </Box>
          );
        } else {
          return (
            <Box component="div" whiteSpace="normal">
              <Typography variant="body2" gutterBottom>
                NA
              </Typography>
            </Box>
          );
        }
      }
    },
    {
      field: 'documentNumber',
      headerName: 'Document number',
      width: 350,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Document number'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'documentType',
      headerName: 'Document type',
      width: 150,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Document type'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'regionCountry',
      headerName: 'Region or country',
      width: 350,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Region or country'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (params.value && params.value !== '') {
          return (
            <Box component="div" whiteSpace="normal">
              <Typography variant="body2" gutterBottom>
                {params.value}
              </Typography>
            </Box>
          );
        } else {
          return (
            <Box component="div" whiteSpace="normal">
              <Typography variant="body2" gutterBottom>
                NA
              </Typography>
            </Box>
          );
        }
      }
    },
    {
      field: 'safetyUpdate',
      headerName: 'Safety update',
      width: 150,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Safety update'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value ? 'Yes' : 'No'}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'revision',
      headerName: 'Revision',
      width: 150,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Revision'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'language',
      headerName: 'Language',
      width: 350,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Language'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (params.value && params.value !== '') {
          return (
            <Box component="div" whiteSpace="normal">
              <Typography variant="body2" gutterBottom>
                {params.value}
              </Typography>
            </Box>
          );
        } else {
          return (
            <Box component="div" whiteSpace="normal">
              <Typography variant="body2" gutterBottom>
                NA
              </Typography>
            </Box>
          );
        }
      }
    },
    {
      field: 'cfn',
      headerName: 'CFNs',
      width: 350,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'CFN'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (params.value && params.value !== '') {
          return (
            <Box component="div" whiteSpace="normal">
              <Typography variant="body2" gutterBottom>
                {params.value}
              </Typography>
            </Box>
          );
        } else {
          return (
            <Box component="div" whiteSpace="normal">
              <Typography variant="body2" gutterBottom>
                NA
              </Typography>
            </Box>
          );
        }
      }
    },
    {
      field: 'audience',
      headerName: 'Audience',
      width: 150,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Audience'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'uploadStatus',
      headerName: 'Upload status',
      width: 150,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Status'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        const statuses = {
          pending: {
            label: 'Pending',
            icon: <PendingIcon />,
            color: 'default'
          },
          queue: {
            label: 'In Queue',
            icon: <AccessAlarmsIcon />,
            color: 'info'
          },
          uploading: {
            label: 'Uploading PDF',
            icon: <PictureAsPdfIcon />,
            color: 'primary'
          },
          processing: {
            label: 'Processing',
            icon: <DataObjectIcon />,
            color: 'secondary'
          },
          completed: {
            label: 'Completed',
            icon: <CheckCircleOutlineIcon />,
            color: 'success'
          },
          error: {
            label: 'Failed',
            icon: <ErrorOutlineIcon />,
            color: 'error'
          },
          warning: {
            label: 'Completed with errors',
            icon: <WarningAmberIcon />,
            color: 'warning'
          }
        };
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              <Chip
                size="small"
                icon={statuses[params.value].icon}
                label={statuses[params.value].label}
                color={statuses[params.value].color}
              />
            </Typography>
          </Box>
        );
      }
    }
  ];

  return (
    <React.Fragment>
      <div className={styles['form-step']}>
        <div style={{ height: 500, width: '100%' }}>
          <DataGridPremium
            initialState={{ pinnedColumns: { left: ['fileName'], right: ['uploadStatus'] } }}
            getRowHeight={({ id, densityFactor }: GridRowHeightParams) => {
              return 150;
            }}
            density="comfortable"
            disableColumnFilter
            disableColumnReorder
            disableMultipleSelection
            disableSelectionOnClick
            disableColumnResize
            disableColumnSelector
            disableColumnMenu
            rows={rows || []}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 15]}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

// override of props to support formik
Submit.label = 'Submit';
Submit.initialValues = {};
Submit.validationSchema = object().shape({});

export default Submit;
