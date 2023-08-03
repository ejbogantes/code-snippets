/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
// authentication & react
import React, { useEffect, useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';

import PageWrapper from '../../../../wrappers/pageWrapper';

// nextjs stuff
import { useRouter } from 'next/router';
import getConfig from 'next/config';

// material ui components
import { Box, Grid, Stack, Typography, Divider } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// mui premium data grid
import {
  DataGridPremium,
  useGridApiRef,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  useKeepGroupedColumnsHidden
} from '@mui/x-data-grid-premium';

// required styles and soom-ui
import styles from './index.module.scss';
import { SoomCard } from '@soom-universe/soom-ui';

// helpers
import { requestGetProfileByEmailOrg, requestListProducts } from '../../../../helpers/request';
import { hasAccess } from '../../../../helpers/PermissionValidator';

// get public runtime settings
const {
  publicRuntimeConfig: { appName }
} = getConfig();

const DataGrid = (props) => {
  const { columns, apiRef, tableState, setTableState } = props;

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      columns: { columnVisibilityModel: { document_number: false } },
      rowGrouping: { model: ['document_number'] }
    }
  });

  return (
    <Grid container spacing={3} sx={{ px: 2, pb: 2 }}>
      <Grid item xs={12}>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGridPremium
            getRowId={(row) => row.primary_di}
            columns={columns}
            rows={tableState.data}
            apiRef={apiRef}
            aria-label="my-products"
            pagination
            paginationMode="server"
            rowCount={tableState.total}
            rowsPerPageOptions={[10]}
            page={tableState.page - 1}
            pageSize={tableState.pageSize}
            loading={tableState.isLoading}
            onPageChange={(newPage) => {
              setTableState((old) => ({ ...old, page: newPage + 1 }));
            }}
            onPageSizeChange={(newPageSize) => setTableState((old) => ({ ...old, pageSize: newPageSize }))}
            // disableColumnResize
            disableMultipleSelection
            disableSelectionOnClick
            disableColumnMenu
            density="standard"
            columnVisibilityModel={{ id: false, document_number: false }}
            initialState={initialState}
            groupingColDef={{
              headerName: 'Document number',
              width: 200,
              headerClassName: styles['soom-eifu-dashboard-table-header'],
              renderHeader: (params: GridColumnHeaderParams) => <strong>{'Document number'}</strong>
            }}
            rowGroupingColumnMode="single"
            defaultGroupingExpansionDepth={1}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

// index page component
export default withPageAuthRequired(function Index({ user }): JSX.Element {
  // hooks
  const router = useRouter();

  const [org, setOrg] = useState(undefined);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(undefined);
  const [pageAccess, setPageAccess] = useState(false);
  const [tableState, setTableState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10
  });

  useEffect(() => {
    if (!router.isReady) return;
    const orgName = router.query.slug as string;
    setOrg(orgName);
  }, [router.isReady]);

  useEffect(() => {
    if (!org) return;
    // get profile data
    const fetchProfileData = async () => {
      const profileResult = await requestGetProfileByEmailOrg(appName, org);
      const pageAccess = hasAccess('listProds', profileResult);

      setProfile(profileResult);
      setPageAccess(pageAccess);
      setLoadingProfile(false);
    };

    fetchProfileData();
  }, [org]);

  useEffect(() => {
    if (!profile || !pageAccess) return;

    // get products data
    const fetchProductsData = async () => {
      // start loading
      setTableState((old) => ({ ...old, isLoading: true }));

      // params
      const params = {
        app: appName,
        org,
        pagination: true,
        skip: tableState.page === 1 ? 0 : tableState.pageSize * (tableState.page - 1),
        limit: tableState.pageSize
      };

      // get data
      const data = await requestListProducts(params);
      if (!data) {
        // updates table state
        setTableState((old) => ({
          ...old,
          isLoading: false,
          data: [],
          total: 0
        }));
        return;
      }

      // updates table state
      const prods = data.products || [];
      setTableState((old) => ({
        ...old,
        isLoading: false,
        data: prods.map((p) => {
          p.document_number = p.document_number || 'Unrelated';
          return p;
        }),
        total: data.pagination.total || 0
      }));
    };

    // get products data
    fetchProductsData();
  }, [profile, pageAccess, tableState.page, tableState.pageSize]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'document_number'
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 100,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Source'}</strong>
    },
    {
      field: 'manufacturer',
      headerName: 'Manufacturer',
      width: 200,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Manufacturer'}</strong>
    },
    {
      field: 'primary_di',
      headerName: 'Primary DI',
      width: 200,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Primary DI'}</strong>
    },
    {
      field: 'all_dis',
      headerName: 'All DIs',
      width: 200,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'All DIs'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (!params.value || !Array.isArray(params.value)) {
          return <></>;
        }
        return params.value.join(', ');
      }
    },
    {
      field: 'brand_name',
      headerName: 'Brand Name',
      width: 200,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Brand Name'}</strong>
    },
    {
      field: 'model_number',
      headerName: 'Model Number',
      width: 100,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Model'}</strong>
    },
    {
      field: 'catalog_number',
      headerName: 'Catalog Number',
      width: 100,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Catalog'}</strong>
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Description'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (!Array.isArray(params.value)) {
          return params.value;
        }
        return params.value.join('. ');
      }
    },
    {
      field: 'mri_safety',
      headerName: 'MRI Safety',
      width: 200,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'MRI Safety'}</strong>
    },
    {
      field: 'is_sterile',
      headerName: 'Sterile',
      width: 100,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Sterile'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (!params.rowNode.isAutoGenerated) {
          if (params.value !== null) {
            return params.value ? <CheckIcon /> : <CloseIcon />;
          } else {
            return '';
          }
        }
      }
    },
    {
      field: 'is_kit',
      headerName: 'Kit',
      width: 100,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Kit'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (!params.rowNode.isAutoGenerated) {
          if (params.value !== null) {
            return params.value ? <CheckIcon /> : <CloseIcon />;
          } else {
            return '';
          }
        }
      }
    },
    {
      field: 'is_rx',
      headerName: 'RX',
      width: 100,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'RX'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (!params.rowNode.isAutoGenerated) {
          if (params.value !== null) {
            return params.value ? <CheckIcon /> : <CloseIcon />;
          } else {
            return '';
          }
        }
      }
    },
    {
      field: 'is_otc',
      headerName: 'OTC',
      width: 100,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'OTC'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (!params.rowNode.isAutoGenerated) {
          if (params.value !== null) {
            return params.value ? <CheckIcon /> : <CloseIcon />;
          } else {
            return '';
          }
        }
      }
    },
    {
      field: 'is_single_use',
      headerName: 'Single Use',
      width: 100,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Single Use'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (!params.rowNode.isAutoGenerated) {
          if (params.value !== null) {
            return params.value ? <CheckIcon /> : <CloseIcon />;
          } else {
            return '';
          }
        }
      }
    }
  ];

  const apiRef = useGridApiRef();

  return (
    <PageWrapper org={org} profile={profile} loading={loadingProfile} pageAccess={pageAccess}>
      <Box className={styles.form__container_full}>
        <SoomCard dataTestId="prueba" ariaLabel="prueba">
          <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
            <Typography variant="h6" component="div">
              <MonitorHeartIcon sx={{ verticalAlign: 'middle' }} /> My Products
            </Typography>
          </Stack>
          <Divider className={styles.divider__header} />
          <DataGrid columns={columns} apiRef={apiRef} tableState={tableState} setTableState={setTableState} />
        </SoomCard>
      </Box>
    </PageWrapper>
  );
});
