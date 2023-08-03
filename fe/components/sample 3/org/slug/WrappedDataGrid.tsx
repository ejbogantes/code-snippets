/* eslint-disable react-hooks/exhaustive-deps */
// react
import React, { useEffect, useState, useRef } from 'react';

// nextjs stuff
import getConfig from 'next/config';
import Link from 'next/link';
import { get as _get } from 'lodash';

// formik and yup
import * as yup from 'yup';
import { useFormik } from 'formik';

// material ui components
import {
  Button,
  Box,
  Chip,
  DialogActions,
  DialogContent,
  DialogContentText,
  Fab,
  IconButton,
  Dialog,
  DialogTitle,
  Grid,
  Tooltip,
  Switch,
  Stack,
  FormGroup,
  FormControlLabel
} from '@mui/material';
import { Delete, Cancel, Grading, Publish, PictureAsPdf, Mode } from '@mui/icons-material';

// mui premium data grid
import {
  DataGridPremium,
  DataGridPremiumProps,
  useGridApiRef,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  // GridSelectionModel,
  useKeepGroupedColumnsHidden
} from '@mui/x-data-grid-premium';

// required styles and soom-ui
import styles from './index.module.scss';
import { SoomButton, SoomSearch, SoomTextField, SoomSelect } from '@soom-universe/soom-ui';

// permissions validator
import { Permissions, hasPermission } from '../../../helpers/PermissionValidator';

// request
import { requestAutocomplete, requestGetDocuments, requestDeleteDocument } from '../../../helpers/request';
import { getDocumentTypeLabel } from '../../../helpers/documents';
import { getSignedUrl } from '../../../helpers/S3';

// manage timeout for autocomplete input
let autoCompleteTimeout = null;

// form validation
const formModalSchema = yup.object({
  deletionReason: yup.string().required('A deletion reason is required')
});

// form initial values
const formModalInitialValues = {
  deletionReason: ''
};

// next js config // settings
const {
  publicRuntimeConfig: {
    documents: {
      list: { features, filtersState, selectionActions, pageSize }
    }
  }
} = getConfig();

const DataGrid = (props) => {
  const { baselineProps, apiRef, initialState, pageState, setPageState } = props;

  return (
    <Grid item xs={12}>
      <Box sx={{ height: 500, width: '97.5%' }}>
        <DataGridPremium
          {...baselineProps}
          groupingColDef={{
            headerName: 'Document number',
            width: 300,
            headerClassName: styles['soom-eifu-dashboard-table-header'],
            renderHeader: (params: GridColumnHeaderParams) => <strong>{'Document number'}</strong>
          }}
          apiRef={apiRef}
          aria-label="my-documents"
          rowGroupingColumnMode="single"
          initialState={initialState}
          pagination
          paginationMode="server"
          rowCount={pageState.total}
          rowsPerPageOptions={[10]}
          page={pageState.page - 1}
          pageSize={pageState.pageSize}
          loading={pageState.isLoading}
          onPageChange={(newPage) => {
            setPageState((old) => ({ ...old, page: newPage + 1 }));
          }}
          onPageSizeChange={(newPageSize) => setPageState((old) => ({ ...old, pageSize: newPageSize }))}
          disableColumnResize
          defaultGroupingExpansionDepth={1}
          disableMultipleSelection
          disableSelectionOnClick
          onSelectionModelChange={(newSelectionModel) => {
            /**
                setSelectionModel(newSelectionModel);
                const checkAction = (model: GridSelectionModel, action: string, button: string) => {
                  const currentSelected = { ...selected };
                  const items = data.filter((item) => model.includes(item.id) && item.status === action);

                  if (model.length === 0) {
                    currentSelected[button].disabled = true;
                  } else {
                    currentSelected[button].disabled = !(items.length === model.length);
                  }

                  setSelected(currentSelected);
                };

                checkAction(newSelectionModel, 'draft', 'review');
                checkAction(newSelectionModel, 'review', 'publish');
                checkAction(newSelectionModel, 'review', 'reject');
                checkAction(newSelectionModel, 'published', 'draft');
                */
          }}
          disableColumnMenu
          density="standard"
          columnVisibilityModel={{
            id: false,
            documentNumber: false
          }}
        />
      </Box>
    </Grid>
  );
};

const DialogDeleteForm = (props) => {
  const { deleteDialogOpen, handleDeleteClose, formikDeleteDocument, deleteDocumentName } = props;

  return (
    <Dialog
      open={deleteDialogOpen}
      onClose={handleDeleteClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <form onSubmit={formikDeleteDocument.handleSubmit}>
        <DialogTitle id="alert-dialog-title">{'Are you sure you want to delete this document?'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item md={12} xs={12}>
              <DialogContentText id="alert-dialog-description">
                You are trying to delete the following document <strong>{deleteDocumentName}</strong>
              </DialogContentText>
            </Grid>
            <Grid item md={12} xs={12}>
              <SoomTextField
                fullWidth
                dataTestId="deletionReason"
                ariaLabel="Deletion Reason"
                id="deletionReason"
                name="deletionReason"
                variant="outlined"
                label="Deletion Reason"
                required={true}
                value={formikDeleteDocument.values.deletionReason}
                handlerOnChange={formikDeleteDocument.handleChange}
                error={
                  formikDeleteDocument.touched.deletionReason && Boolean(formikDeleteDocument.errors.deletionReason)
                }
                helperText={formikDeleteDocument.touched.deletionReason && formikDeleteDocument.errors.deletionReason}
                disabled={formikDeleteDocument.isSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <SoomButton
            dataTestId="btnCancel"
            ariaLabel="Cancel"
            variant="outlined"
            handlerOnClick={handleDeleteClose}
            label="Cancel"
            type="button"
            disabled={formikDeleteDocument.isSubmitting}
          />
          <SoomButton
            dataTestId="btnSubmit"
            ariaLabel="Continue"
            variant="contained"
            handlerOnClick={formikDeleteDocument.handleSubmit}
            label="Continue"
            type="submit"
            loading={formikDeleteDocument.isSubmitting}
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};

const WrappedDataGrid = ({ app, org, user, profile, BUState }) => {
  const bucket = _get(profile, 'organizationProfiles.0.configuration.bucket', '');
  const canDelete = hasPermission(Permissions.DELETE_DOCUMENT, profile);
  const canDeletePublished = hasPermission(Permissions.DELETE_PUBLISHED_DOCUMENT, profile);

  const autoCompleteInputRef = useRef<HTMLInputElement>();

  const [data, setData] = useState([]);
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize
  });
  const [BUSelected, setBUSelected] = useState('-1');

  // grid hooks
  const apiRef = useGridApiRef();
  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      columns: {
        columnVisibilityModel: {
          documentNumber: false
        }
      },
      rowGrouping: {
        model: ['documentNumber']
      }
    }
  });

  // multiple actions
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] = useState(false);
  const [multipleReviewDialogOpen, setMultipleReviewDialogOpen] = useState(false);
  const [multipleRejectDialogOpen, setMultipleRejectDialogOpen] = useState(false);
  const [multiplePublishDialogOpen, setMultiplePublishDialogOpen] = useState(false);
  const [multipleDraftDialogOpen, setMultipleDraftDialogOpen] = useState(false);
  const [selectedItemsString, setSelectedItemsString] = useState('');

  const [filters, setFilters] = useState(filtersState);
  const [selected, setSelected] = useState(selectionActions);
  const [selectionModel] = useState([]);

  // autocomplete
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [autoCompleteData, setAutoCompleteData] = useState([]);
  const [autoCompleteOpen, setAutoCompleteOpen] = useState<boolean>(false);

  // deleting
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteMsg, setDeleteMsg] = useState(NaN);

  // error dialog
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  // statuses filters stringify
  const stringifyFilters = () => {
    const enabledStatusFilters = filtersState.status.filter((o) => o.on);
    return `["${enabledStatusFilters
      .map((i) => {
        const statusChange = {
          draft: 'unpublished',
          in_review: 'pending'
        };
        return i.slug in statusChange ? statusChange[i.slug] : i.slug;
      })
      .join('","')}"]`;
  };

  interface DocProps {
    app: string;
    org: string;
    orderBy?: string;
    pagination?: boolean;
    skip?: number;
    limit?: number;
    searchTerm?: string;
    statuses: string;
    businessUnit?: string;
  }

  useEffect(() => {
    // auto focus autocomplete input
    if (autoCompleteInputRef && autoCompleteInputRef.current) {
      autoCompleteInputRef.current.focus();
    }

    setFilters(filtersState);
    setSelected(selectionActions);
    setSelectedItemsString('');
  }, []);

  // loading the data
  useEffect(() => {
    fetchGridData().catch(console.error);
  }, [pageState.page, pageState.pageSize, filters, BUSelected]);

  const fetchAutoCompleteData = async (search) => {
    clearTimeout(autoCompleteTimeout);
    autoCompleteTimeout = setTimeout(async () => {
      setAutoCompleteData([]);
      setAutoCompleteOpen(true);
      const autoCompleteResults = await requestAutocomplete({
        app,
        org,
        searchTerm: search,
        limit: 3,
        businessUnit: BUSelected !== '-1' ? BUSelected : undefined
      });
      setAutoCompleteData(autoCompleteResults);
      setAutoCompleteOpen(autoCompleteResults.length > 0);
    }, 1000);
  };

  const fetchGridData = async () => {
    if (bucket !== '') {
      // start loading
      setPageState((old) => ({ ...old, isLoading: true }));

      // params
      let params: DocProps = {
        app,
        org,
        orderBy: 'documentNumber',
        pagination: true,
        skip: pageState.page === 1 ? 0 : pageState.pageSize * (pageState.page - 1),
        limit: pageState.pageSize,
        statuses: stringifyFilters(),
        businessUnit: BUSelected !== '-1' ? BUSelected : undefined
      };

      // if search is triggered
      if (searchTerm !== '') {
        params = { ...params, searchTerm };
      }

      // get data
      const data = await requestGetDocuments(params);
      if (data) {
        // updates page state
        setPageState((old) => ({
          ...old,
          isLoading: false,
          data: data.documents || [],
          total: data.pagination.total || 0
        }));
      } else {
        // updates page state
        setPageState((old) => ({
          ...old,
          isLoading: false,
          data: [],
          total: 0
        }));
      }
    }
  };

  const handleDeleteClickOpen = (msg) => {
    setDeleteMsg(msg);
    setDeleteDialogOpen(true);
  };

  const handleMultipleDeleteClickOpen = () => {
    updateSelectedItems();
    setTimeout(() => {
      setMultipleDeleteDialogOpen(true);
    }, 300);
  };

  const handleMultipleReviewClickOpen = () => {
    updateSelectedItems();
    setTimeout(() => {
      setMultipleReviewDialogOpen(true);
    }, 300);
  };

  const handleMultipleRejectClickOpen = () => {
    updateSelectedItems();
    setTimeout(() => {
      setMultipleRejectDialogOpen(true);
    }, 300);
  };

  const handleMultiplePublishClickOpen = () => {
    updateSelectedItems();
    setTimeout(() => {
      setMultiplePublishDialogOpen(true);
    }, 300);
  };

  const handleMultipleDraftClickOpen = () => {
    updateSelectedItems();
    setTimeout(() => {
      setMultipleDraftDialogOpen(true);
    }, 300);
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    formikDeleteDocument.resetForm();
  };

  const handleMultipleDeleteClose = () => {
    setMultipleDeleteDialogOpen(false);
  };

  const handleMultipleReviewClose = () => {
    setMultipleReviewDialogOpen(false);
  };

  const handleMultipleRejectClose = () => {
    setMultipleRejectDialogOpen(false);
  };

  const handleMultiplePublishClose = () => {
    setMultiplePublishDialogOpen(false);
  };

  const handleMultipleDraftClose = () => {
    setMultipleDraftDialogOpen(false);
  };

  const handleMultipleDelete = () => {
    setMultipleDeleteDialogOpen(false);
    const currentData = [...data];
    setTimeout(() => {
      selectionModel.forEach((i) => {
        const index = currentData.findIndex((item) => item.id === i);
        currentData.splice(index, 1);
        setData(currentData);
      });
    }, 300);
  };

  const handleMultipleReview = () => {
    setMultipleReviewDialogOpen(false);
    const currentData = [...data];
    setTimeout(() => {
      selectionModel.forEach((i) => {
        const index = currentData.findIndex((item) => item.id === i);
        currentData[index].status = 'review';
        setData(currentData);
      });
    }, 300);
  };

  const handleMultipleReject = () => {
    setMultipleRejectDialogOpen(false);
    const currentData = [...data];
    setTimeout(() => {
      selectionModel.forEach((i) => {
        const index = currentData.findIndex((item) => item.id === i);
        currentData[index].status = 'rejected';
        setData(currentData);
      });
    }, 300);
  };

  const handleMultiplePublish = () => {
    setMultiplePublishDialogOpen(false);
    const currentData = [...data];
    setTimeout(() => {
      selectionModel.forEach((i) => {
        const index = currentData.findIndex((item) => item.id === i);
        currentData[index].status = 'published';
        setData(currentData);
      });
    }, 300);
  };

  const handleMultipleDraft = () => {
    setMultipleDraftDialogOpen(false);
    const currentData = [...data];
    setTimeout(() => {
      selectionModel.forEach((i) => {
        const index = currentData.findIndex((item) => item.id === i);
        currentData[index].status = 'draft';
        setData(currentData);
      });
    }, 300);
  };

  // updates the filters
  const filterData = (event: React.ChangeEvent<HTMLInputElement>) => {
    // get filters
    const currentFiltersState = { ...filters };

    // get the switch value and loop the filters
    const val = event.target.value;
    currentFiltersState.status.forEach((element) => {
      if (element.slug === val) {
        element.on = !element.on;
      }
    });

    // update the filters and get the current filtering criteria
    setFilters(currentFiltersState);
  };

  function updateSelectedItems() {
    const currentData = [...data];
    const selectedItems = currentData.filter((item) => selectionModel.includes(item.id));
    setSelectedItemsString(' ' + selectedItems.map((item) => item.documentName).join(', '));
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'documentNumber'
    },
    {
      field: 'documentName',
      headerName: 'File Name',
      width: 350,
      headerClassName: styles['soom-eifu-dashboard-table-header'],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'File name'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (params.value) {
          let status = params.row.status;
          if (status in filtersState.statusMatch) {
            status = filtersState.statusMatch[status];
          }
          const URI = `/org/${org}/docs/edit/${params.row.id}`;
          return (
            <Link legacyBehavior href={URI}>
              <a
                data-test-id="linkEditDocument"
                rel="noopener"
                className={styles['soom-eifu-link']}
                style={{
                  wordWrap: 'break-word'
                }}>
                {params.value}
              </a>
            </Link>
          );
        }
        return <></>;
      }
    },
    {
      field: 'revision',
      headerName: 'Revision',
      width: 200,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Revision'}</strong>
    },
    {
      field: 'documentType',
      headerName: 'Document Type',
      width: 200,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Document Type'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return getDocumentTypeLabel(params.value);
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Status'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (params.value) {
          // TODO: temporary match between old workflow statuses and new statuses
          let statusString = params.value.toString();
          if (statusString in filtersState.statusMatch) {
            statusString = filtersState.statusMatch[statusString];
          }
          const status = filters.status.find((o) => o.slug === statusString);
          if (status) {
            return <Chip label={status.name} color={status.color} size="small" />;
          }
          return <Chip label={params.value} color="primary" size="small" />;
        }
        return <></>;
      }
    },
    {
      field: 'updatedAt',
      headerName: 'Last updated',
      width: 200,
      type: 'dateTime',
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Last updated'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (params.value === null) {
          return params.row.createdAt;
        }
        return params.value;
      }
    },
    {
      field: '',
      headerName: '',
      width: 150,
      type: 'actions',
      headerClassName: styles[`soom-eifu-dashboard-table-header`],
      renderCell: (params: GridRenderCellParams<string>) => {
        if (!params.row.status) {
          return <></>;
        }

        const canDeleteDoc = params.row.status === 'published' ? canDeletePublished : canDelete;
        return (
          <Stack direction="row" spacing={0} justifyContent="flex-start" alignItems="center">
            <Tooltip title={'View document'} placement="top">
              <IconButton
                aria-label="view pdf"
                data-test-id="btnViewPDF"
                color="primary"
                size="small"
                onClick={async () => {
                  const url = params.row.file.split('/');
                  const signedUrl = await getSignedUrl(bucket, `${url[3]}/${url[4]}`);
                  window.open(signedUrl, '_blank').focus();
                }}>
                <PictureAsPdf />
              </IconButton>
            </Tooltip>
            {canDeleteDoc && (
              <Tooltip title={'Delete document'} placement="top">
                <IconButton
                  aria-label="delete"
                  data-test-id="btnDeletePDF"
                  color="primary"
                  size="small"
                  onClick={() => {
                    handleDeleteClickOpen(params.row.id);
                  }}>
                  <Delete />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      }
    }
  ];

  // the baseline props for the data grid
  const baselineProps: DataGridPremiumProps = {
    rows: pageState.data,
    columns
  };

  // show document name based on id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const showDocumentName = (id: string | any) => {
    const documents = pageState.data.filter((d) => d.id === id);
    if (documents.length === 1) {
      return documents[0].documentName;
    }
    return '';
  };

  // formik
  const formikDeleteDocument = useFormik({
    initialValues: formModalInitialValues,
    validationSchema: formModalSchema,
    onSubmit: async (values) => {
      try {
        const deleteDocumentData = {
          app,
          org,
          delete_reason: values.deletionReason,
          key: deleteMsg,
          email: user.email
        };

        const requestDeleteDocumentResult = await requestDeleteDocument(deleteDocumentData);
        // request error
        if (!requestDeleteDocumentResult.valid) {
          setDeleteDialogOpen(false);
          setShowErrorDialog(true);
          return;
        }

        setDeleteDialogOpen(false);
        formikDeleteDocument.resetForm();
        fetchGridData().catch(console.error);
      } catch (error) {
        console.error(error);
        setDeleteDialogOpen(false);
        setShowErrorDialog(true);
      }
    }
  });

  return (
    <Grid container spacing={3}>
      {features.autocomplete && (
        <Grid item xs={12}>
          <SoomSearch
            open={autoCompleteOpen}
            inputRef={autoCompleteInputRef}
            autoComplete
            size="medium"
            options={autoCompleteData}
            width="60%"
            fullWidth
            freeSolo
            loading={searchTerm !== '' && searchTerm.length > 3}
            autoSelect
            disableClearable
            clearOnEscape
            blurOnSelect
            limitTags={1}
            searchButtonVariant="contained"
            searchButtonColor="info"
            searchButtonSize="medium"
            placeholder="Product code, CFN, GTIN, manufacturer, product name"
            searchIcon
            variant="standard"
            inputValue={searchTerm}
            onSearch={async () => {
              setAutoCompleteOpen(false);
              await fetchGridData().catch(console.error);
            }}
            onChange={async (_e, value, reason) => {
              setSearchTerm(value);
              if (reason === 'input') {
                fetchAutoCompleteData(value);
                setAutoCompleteOpen(true);
              }
            }}
            onClose={(_e, _r) => {
              setAutoCompleteOpen(false);
            }}
          />
        </Grid>
      )}
      {features.filters && (
        <Grid container direction="row" spacing={3} sx={{ mt: '24px', mx: '24px', width: '100%' }}>
          <Grid item xs={12} md={6} sx={{ display: 'inline-flex' }}>
            <FormGroup row>
              {filters.status.map((item) => (
                <FormControlLabel
                  className={styles['soom-eifu-dashboard-switch-label']}
                  key={item.slug}
                  control={<Switch color={item.color} size="small" onChange={filterData} value={item.slug} />}
                  disableTypography
                  label={item.name}
                  checked={item.on}
                />
              ))}
            </FormGroup>
          </Grid>
          {BUState.show && (
            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
              <SoomSelect
                widthAuto
                dataTestId="businessUnitFilter"
                ariaLabel="businessUnitFilterLabel"
                options={BUState.options}
                isMultiple={false}
                id="businessUnitFilter"
                name="businessUnitFilter"
                label=""
                value={BUSelected}
                onChange={(event) => {
                  if (event.target) {
                    setBUSelected(event.target.value);
                  }
                }}
              />
            </Grid>
          )}
        </Grid>
      )}
      {features.actions && (
        <Grid item xs={6} style={{ textAlign: 'right', paddingLeft: 0 }}>
          <Box sx={{ '& > :not(style)': { m: 1 } }}>
            <Tooltip title={'Send back to draft'} placement="top">
              <span>
                <Fab
                  onClick={handleMultipleDraftClickOpen}
                  size="small"
                  color="secondary"
                  aria-label="send-back-to-draft"
                  disabled={selected.draft.disabled}
                  sx={{
                    textTransform: 'none',
                    boxShadow: '0',
                    visibility: selectionModel.length === 0 ? 'hidden' : ''
                  }}>
                  <Mode />
                </Fab>
              </span>
            </Tooltip>
            <Tooltip title={'Send for review'} placement="top">
              <span>
                <Fab
                  onClick={handleMultipleReviewClickOpen}
                  size="small"
                  color="warning"
                  aria-label="send-for-review"
                  disabled={selected.review.disabled}
                  sx={{
                    textTransform: 'none',
                    boxShadow: '0',
                    visibility: selectionModel.length === 0 ? 'hidden' : ''
                  }}>
                  <Grading />
                </Fab>
              </span>
            </Tooltip>
            <Tooltip title={selected.publish.name} placement="top">
              <span>
                <Fab
                  onClick={handleMultiplePublishClickOpen}
                  size="small"
                  aria-label="publish"
                  color="success"
                  disabled={selected.publish.disabled}
                  sx={{
                    textTransform: 'none',
                    boxShadow: '0',
                    visibility: selectionModel.length === 0 ? 'hidden' : ''
                  }}>
                  <Publish />
                </Fab>
              </span>
            </Tooltip>
            <Tooltip title={selected.reject.name} placement="top">
              <span>
                <Fab
                  onClick={handleMultipleRejectClickOpen}
                  size="small"
                  aria-label="reject"
                  color="error"
                  disabled={selected.reject.disabled}
                  sx={{
                    textTransform: 'none',
                    boxShadow: '0',
                    visibility: selectionModel.length === 0 ? 'hidden' : ''
                  }}>
                  <Cancel />
                </Fab>
              </span>
            </Tooltip>
            <Tooltip title="Delete" placement="top">
              <span>
                <Fab
                  onClick={handleMultipleDeleteClickOpen}
                  size="small"
                  aria-label="delete"
                  sx={{
                    textTransform: 'none',
                    boxShadow: '0',
                    visibility: selectionModel.length === 0 ? 'hidden' : ''
                  }}>
                  <Delete />
                </Fab>
              </span>
            </Tooltip>
          </Box>
        </Grid>
      )}
      {features.grid && (
        <>
          <DataGrid
            baselineProps={baselineProps}
            apiRef={apiRef}
            initialState={initialState}
            pageState={pageState}
            setPageState={setPageState}
          />
          <DialogDeleteForm
            deleteDialogOpen={deleteDialogOpen}
            handleDeleteClose={handleDeleteClose}
            formikDeleteDocument={formikDeleteDocument}
            deleteDocumentName={deleteMsg ? ' ' + showDocumentName(deleteMsg) : ''}
          />
          <Dialog
            open={showErrorDialog}
            onClose={handleErrorDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{'Error | Contact your system administrator'}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                There was an error trying to process your request.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <SoomButton
                variant="text"
                ariaLabel="error dialog ok button"
                dataTestId="errorok"
                label="Ok"
                handlerOnClick={handleErrorDialogClose}
                autoFocus
              />
            </DialogActions>
          </Dialog>
          <Dialog
            open={multipleDeleteDialogOpen}
            onClose={handleMultipleDeleteClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{'Are you sure you want to delete the following rows?'}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                You are trying to delete the following rows
                <strong>{selectedItemsString}</strong>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleMultipleDeleteClose}>No</Button>
              <Button onClick={handleMultipleDelete} autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={multipleReviewDialogOpen}
            onClose={handleMultipleReviewClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">
              {'Are you sure you want to Send for Review the following rows?'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                You are trying to Send for Review the following rows
                <strong>{selectedItemsString}</strong>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleMultipleReviewClose}>No</Button>
              <Button onClick={handleMultipleReview} autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={multipleRejectDialogOpen}
            onClose={handleMultipleRejectClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{'Are you sure you want to Reject the following rows?'}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                You are trying to Reject the following rows
                <strong>{selectedItemsString}</strong>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleMultipleRejectClose}>No</Button>
              <Button onClick={handleMultipleReject} autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={multiplePublishDialogOpen}
            onClose={handleMultiplePublishClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{'Are you sure you want to Publish the following rows?'}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                You are trying to Publish the following rows
                <strong>{selectedItemsString}</strong>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleMultiplePublishClose}>No</Button>
              <Button onClick={handleMultiplePublish} autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={multipleDraftDialogOpen}
            onClose={handleMultipleDraftClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">
              {'Are you sure you want to Send Back to Draft the following rows?'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                You are trying to Send Back to Draft the following rows
                <strong>{selectedItemsString}</strong>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleMultipleDraftClose}>No</Button>
              <Button onClick={handleMultipleDraft} autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Grid>
  );
};

export default WrappedDataGrid;
