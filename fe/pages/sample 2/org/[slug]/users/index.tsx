/* eslint-disable react-hooks/exhaustive-deps */
// authentication & react
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import Link from 'next/link';
import { get as _get } from 'lodash';

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
import { Delete as DeleteIcon, Group as GroupIcon } from '@mui/icons-material';
import { SoomCard, SoomButton } from '@soom-universe/soom-ui';

// the page wrapper
import PageWrapper from '../../../../wrappers/pageWrapper';

import { DataGrid, GridColDef, GridColumnHeaderParams, GridRenderCellParams } from '@mui/x-data-grid';

// helpers
import { requestDeleteUser, requestGetProfileByEmailOrg, requestGetUsers } from '../../../../helpers/request';
import { hasAccess } from '../../../../helpers/PermissionValidator';

// required styles
import styles from './index.module.scss';

// get public runtime settings
const {
  publicRuntimeConfig: { appName }
} = getConfig();

// user status
const filtersState = {
  status: [
    {
      slug: 'disabled',
      name: 'Disabled',
      color: 'error' as const,
      on: true
    },
    {
      slug: 'enabled',
      name: 'Enabled',
      color: 'success' as const,
      on: true
    }
  ]
};

export default withPageAuthRequired(function Index({ user }) {
  const router = useRouter();

  // hooks
  const [deleteUserState, setDeleteUserState] = useState({
    open: false,
    loading: false,
    profileId: null,
    profileName: null
  });
  const [org, setOrg] = useState<string>(undefined);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(undefined);
  const [pageAccess, setPageAccess] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState([]);
  const [hasBUs, setHasBUs] = useState(false);
  const [filters] = useState(filtersState);

  useEffect(() => {
    if (!router.isReady) return;
    const orgName = router.query.slug as string;
    setOrg(orgName);
  }, [router.isReady]);

  useEffect(() => {
    if (!org) return;
    // get profile data
    const fetchProfileData = async () => {
      // get data from db
      setLoadingProfile(true);
      const profile = await requestGetProfileByEmailOrg(appName, org);
      const pageAccess = hasAccess('listUsers', profile);
      const businessUnit = _get(profile, 'organizationProfiles[0].businessUnit', null);
      const businessUnits = _get(profile, 'orgBusinessUnits', []);

      setHasBUs(businessUnit || businessUnits.length > 0);
      setProfile(profile);
      setPageAccess(pageAccess);
      setLoadingProfile(false);
    };

    fetchProfileData();
  }, [org]);

  useEffect(() => {
    if (!profile || !pageAccess) return;
    fetchUsersData();
  }, [profile, pageAccess]);

  // get users data
  const fetchUsersData = async () => {
    // get data from db
    setLoadingData(true);
    const usersList = await requestGetUsers(appName, org);
    setData(usersList || []);
    setLoadingData(false);
  };

  function handleDeleteClickOpen(profileId, profileName) {
    setDeleteUserState((prevState) => ({ ...prevState, open: true, profileId, profileName }));
  }

  const handleDeleteClose = () => {
    setDeleteUserState({ open: false, loading: false, profileId: null, profileName: null });
  };

  const handleDelete = async () => {
    setDeleteUserState((prevState) => ({ ...prevState, loading: true }));
    await requestDeleteUser(deleteUserState.profileId, appName, org);
    handleDeleteClose();
    fetchUsersData();
  };

  // documents data
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'name',
      headerName: 'First Name',
      width: 175,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderCell: (params: GridRenderCellParams<string>) => (
        <Link legacyBehavior href={`/org/${org}/users/edit/${params.id}`}>
          <a rel="noopener" className={styles['soom-eifu-link']}>
            {params.value}
          </a>
        </Link>
      ),
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'First Name'}</strong>
    },
    {
      field: 'lastName',
      headerName: 'Last name',
      width: 200,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Last Name'}</strong>
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Email'}</strong>
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Role'}</strong>
    },
    {
      field: 'businessUnit',
      headerName: 'Business Unit',
      width: 200,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Business Unit'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return params.value || 'All Business Units';
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderCell: (params: GridRenderCellParams<string>) => {
        const statusSlug = params.value ? 'enabled' : 'disabled';
        const status = filters.status.find((o) => o.slug === statusSlug);
        return <Chip label={status.name} color={status.color} size="small" />;
      },
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Status'}</strong>
    },
    {
      field: '',
      type: 'actions',
      headerName: '',
      headerAlign: 'center',
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <IconButton
            aria-label="delete"
            color="primary"
            size="small"
            onClick={() => {
              handleDeleteClickOpen(params.row.id, params.row.name);
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
              <GroupIcon sx={{ verticalAlign: 'middle' }} /> Users
            </Typography>
          </Stack>
          <Divider className={styles.divider__header} />
          <Grid container spacing={3} sx={{ px: 2, pb: 2 }}>
            <Grid item xs={12}>
              <Box sx={{ width: '100%' }}>
                <DataGrid
                  aria-label="my-users"
                  loading={loadingData}
                  rows={data}
                  columns={columns}
                  pageSize={10}
                  autoHeight
                  rowsPerPageOptions={[10]}
                  checkboxSelection={false}
                  disableSelectionOnClick
                  disableColumnMenu
                  density="compact"
                  columnVisibilityModel={{
                    id: false,
                    businessUnit: hasBUs
                  }}
                />
                <Dialog
                  open={deleteUserState.open}
                  onClose={handleDeleteClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="alert-dialog-title">{'Are you sure you want to delete this user?'}</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                      You are trying to delete the following user <strong>{deleteUserState.profileName}</strong>
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
                      disabled={deleteUserState.loading}
                    />
                    <SoomButton
                      dataTestId="btnYes"
                      ariaLabel="btnYes"
                      variant="text"
                      handlerOnClick={handleDelete}
                      label="Continue"
                      type="button"
                      loading={deleteUserState.loading}
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
