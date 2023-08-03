/* eslint-disable react-hooks/exhaustive-deps */
// required styles
import styles from './index.module.scss';

// authentication & react
import React, { useEffect, useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import getConfig from 'next/config';

// material ui components
import {
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
  Grid,
  Divider
} from '@mui/material';

import { Delete as DeleteIcon, Key as KeyIcon, Add as AddIcon } from '@mui/icons-material';

import { DataGrid, GridColDef, GridColumnHeaderParams, GridRenderCellParams } from '@mui/x-data-grid';

// the page wrapper
import PageWrapper from '../../../../wrappers/pageWrapper';

// helpers
import {
  requestGetProfileByEmailOrg,
  requestGetApiKeys,
  requestCreateApiKey,
  requestDeleteApiKey
} from '../../../../helpers/request';
import { hasAccess } from '../../../../helpers/PermissionValidator';

import { SoomCard, SoomButton } from '@soom-universe/soom-ui';

// get public runtime settings
const {
  publicRuntimeConfig: { appName }
} = getConfig();

export default withPageAuthRequired(function Index({ user }) {
  const router = useRouter();

  // hooks
  const [createState, setCreateState] = useState({ open: false, loading: false });
  const [deleteState, setDeleteState] = useState({ open: false, loading: false, key: null });
  const [org, setOrg] = useState<string>(undefined);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(undefined);
  const [pageAccess, setPageAccess] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!router.isReady) return;
    const orgName = router.query.slug as string;
    setOrg(orgName);
  }, [router.isReady]);

  useEffect(() => {
    if (!org) return;
    // get profile data
    const fetchProfileData = async () => {
      const profile = await requestGetProfileByEmailOrg(appName, org);
      const pageAccess = hasAccess('apiKeys', profile);
      setProfile(profile);
      setPageAccess(pageAccess);
      setLoadingProfile(false);
    };

    fetchProfileData();
  }, [org]);

  useEffect(() => {
    if (!profile || !pageAccess) return;
    fetchData();
  }, [profile, pageAccess]);

  const fetchData = async () => {
    // get data from db
    setLoadingData(true);
    const apiKeysList = await requestGetApiKeys(appName, org);
    setData(apiKeysList || []);
    setLoadingData(false);
  };

  function handleDeleteClickOpen(key) {
    setDeleteState((prevState) => ({ ...prevState, open: true, key }));
  }

  const handleDeleteClose = () => {
    setDeleteState({ open: false, loading: false, key: null });
  };

  const handleDelete = async () => {
    setDeleteState((prevState) => ({ ...prevState, loading: true }));
    await requestDeleteApiKey(appName, org, deleteState.key);
    handleDeleteClose();
    fetchData();
  };

  function handleCreateClickOpen() {
    setCreateState((prevState) => ({ ...prevState, open: true }));
  }

  const handleCreateClose = () => {
    setCreateState({ open: false, loading: false });
  };

  const handleCreate = async () => {
    setCreateState((prevState) => ({ ...prevState, loading: true }));
    await requestCreateApiKey(appName, org);
    handleCreateClose();
    fetchData();
  };

  // documents data
  const columns: GridColDef[] = [
    {
      field: 'key',
      headerName: 'API Key',
      width: 500,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'API Key'}</strong>
    },
    {
      field: 'enable',
      headerName: 'Status',
      width: 250,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Status'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (params.row.enabled) {
          return <Chip label="Enable" color="success" size="small" />;
        }
        return <Chip label="Disable" color="error" size="small" />;
      }
    },
    {
      field: '',
      type: 'actions',
      headerName: '',
      width: 100,
      headerAlign: 'center',
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <IconButton
            aria-label="delete"
            color="primary"
            size="small"
            onClick={() => {
              handleDeleteClickOpen(params.row.key);
            }}
          >
            <DeleteIcon />
          </IconButton>
        );
      }
    }
  ];

  return (
    <PageWrapper org={org} profile={profile} loading={loadingProfile} pageAccess={pageAccess}>
      <Box className={styles.form__container_full}>
        <SoomCard dataTestId="prueba" ariaLabel="prueba">
          <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
            <Typography variant="h6" component="div">
              <KeyIcon sx={{ verticalAlign: 'middle' }} /> API Keys
            </Typography>
          </Stack>
          <Divider className={styles.divider__header} />
          <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
            <Typography variant="body1" component="p">
              <SoomButton
                dataTestId="btnNo"
                ariaLabel="btnNo"
                variant="contained"
                handlerOnClick={handleCreateClickOpen}
                label={
                  <>
                    <AddIcon sx={{ verticalAlign: 'middle' }} /> Create API Key
                  </>
                }
                type="button"
                disabled={createState.loading}
              />
            </Typography>
          </Stack>
          <Grid container spacing={3} sx={{ px: 2, pb: 2 }}>
            <Grid item xs={12}>
              <Box sx={{ width: '100%' }}>
                <DataGrid
                  aria-label="api-keys"
                  loading={loadingData}
                  rows={data}
                  columns={columns}
                  autoHeight
                  hideFooterPagination
                  checkboxSelection={false}
                  disableSelectionOnClick
                  disableColumnMenu
                  density="compact"
                  getRowId={(row) => row.key}
                />
                <Dialog
                  open={deleteState.open}
                  onClose={handleDeleteClose}
                  aria-labelledby="delete-dialog-title"
                  aria-describedby="delete-dialog-description"
                >
                  <DialogTitle id="delete-dialog-title">{'Are you sure you want to delete this API key?'}</DialogTitle>
                  <Divider />
                  <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                      You are trying to delete the following API key <strong>{deleteState.key}</strong>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <SoomButton
                      dataTestId="btnNo"
                      ariaLabel="btnNo"
                      variant="text"
                      handlerOnClick={handleDeleteClose}
                      label="Cancel"
                      type="button"
                      disabled={deleteState.loading}
                    />
                    <SoomButton
                      dataTestId="btnYes"
                      ariaLabel="btnYes"
                      variant="text"
                      handlerOnClick={handleDelete}
                      label="Continue"
                      type="button"
                      loading={deleteState.loading}
                    />
                  </DialogActions>
                </Dialog>

                <Dialog
                  open={createState.open}
                  onClose={handleCreateClose}
                  aria-labelledby="create-dialog-title"
                  aria-describedby="create-dialog-description"
                >
                  <DialogTitle id="create-dialog-title">{'Are you sure you want to create a new API key?'}</DialogTitle>
                  <Divider />
                  <DialogContent>
                    <DialogContentText id="create-dialog-description">
                      Press <strong>Continue</strong> to create a new API key
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <SoomButton
                      dataTestId="btnNo"
                      ariaLabel="btnNo"
                      variant="text"
                      handlerOnClick={handleCreateClose}
                      label="Cancel"
                      type="button"
                      disabled={createState.loading}
                    />
                    <SoomButton
                      dataTestId="btnYes"
                      ariaLabel="btnYes"
                      variant="text"
                      handlerOnClick={handleCreate}
                      label="Continue"
                      type="button"
                      loading={createState.loading}
                    />
                  </DialogActions>
                </Dialog>
              </Box>
            </Grid>
          </Grid>
        </SoomCard>
      </Box>
    </PageWrapper>
  );
});
