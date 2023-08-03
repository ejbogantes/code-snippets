/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
// react and next
import React, { useState, useEffect } from 'react';

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
import DoneIcon from '@mui/icons-material/Done';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// get soom constants
import { audienceValues } from '@soom-universe/soom-utils/constants';

// yup and others
import { object } from 'yup';
import styles from '../../bulk-upload/index.module.scss';

// excel
import readXlsxFile from 'read-excel-file';

const isValidValue = (value: any) => {
  if (typeof value === 'undefined') return false;
  return value !== '' && value !== null;
};

// check region is valid
function isRegion(region: string, regions: any[]) {
  if (region === '' || region === null) return true;

  const regionsValues = region.split(',');
  let result = 0;
  for (let index = 0; index < regionsValues.length; index++) {
    const is = regions.findIndex((o) => o.value === regionsValues[index]) !== -1;
    if (is) {
      result++;
    }
  }
  return result === regionsValues.length;
}

// check language is valid
function isLanguage(lang: string, languages: any[]) {
  if (lang === '' || lang === null) return true;
  const langs = lang.split(',');

  let result = 0;
  for (let index = 0; index < langs.length; index++) {
    const is = languages.findIndex((o) => o.value === langs[index]) !== -1;
    if (is) {
      result++;
    }
  }

  return result === langs.length;
}

// check language is valid
function isAudience(audience: string) {
  if (!isValidValue(audience)) {
    return false;
  }

  audience = audience.trim();

  const indexOf = audienceValues.indexOf(audience);

  return indexOf >= 0;
}

function createData(o: any[], files: any[], regions: any[], languages: any[], index: number) {
  const fileMatches = files && files.length > 0 && files.filter((f) => f.name === o[0]).length === 1;
  const brandNameMatched = isValidValue(o[1]);
  const documentNumberMatched = isValidValue(o[3]);
  const documentTypeMatched = isValidValue(o[4]);
  const regionMatches = isRegion(o[5], regions);
  const revisionMatched = isValidValue(o[7]);
  const langMatches = isLanguage(o[8], languages);
  const audienceMatches = isAudience(o[15]);

  const status =
    fileMatches &&
    brandNameMatched &&
    documentNumberMatched &&
    documentTypeMatched &&
    regionMatches &&
    revisionMatched &&
    langMatches;

  const objRow = {
    id: `document-${index}`,
    fileName: o[0],
    fileNameError: fileMatches ? false : 'Not found',
    file: fileMatches ? files.filter((f) => f.name === o[0])[0] : undefined,
    brandName: brandNameMatched ? o[1] : '',
    brandNameError: brandNameMatched ? false : 'Brand name is required',
    alternateBrandName: isValidValue(o[2]) ? o[2] : '',
    documentNumber: documentNumberMatched ? o[3] : '',
    documentNumberError: documentNumberMatched ? false : 'Document number is required',
    documentType: documentTypeMatched ? o[4] : '',
    documentTypeError: documentTypeMatched ? false : 'Document type is required',
    regionCountry: isValidValue(o[5]) ? o[5] : '',
    regionCountryError: regionMatches
      ? false
      : 'One or more of the regions are not valid. Check the regions in settings',
    safetyUpdate: revisionMatched ? o[6] : '',
    revision: revisionMatched ? o[7].toString() : '',
    revisionError: revisionMatched ? false : 'Revision is required',
    language: isValidValue(o[8]) ? o[8] : '',
    languageError: langMatches
      ? false
      : 'One or more of the languages are not valid in the settings. Check the languages in settings',
    cfn: isValidValue(o[9]) ? o[9] : '',
    audience: isValidValue(o[15]) ? o[15].trim() : '',
    audienceError: audienceMatches ? false : `Audience is not valid. Accepted values: ${audienceValues.join(', ')}`,
    status,
    uploadStatus: 'pending',
    gtins: isValidValue(o[16]) ? o[16] : '',
    definition: isValidValue(o[17]) ? o[17] : '',
    description: isValidValue(o[18]) ? o[18] : ''
  };

  return objRow;
}

const Validation = ({ files, spreadsheet, onChange, regions, languages }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataRows = await readXlsxFile(spreadsheet, { sheet: 2 });
        if (dataRows) {
          const newRows = [];
          for (let i = 1; i < dataRows.length; i++) {
            newRows.push(createData(dataRows[i], files, regions, languages, i));
          }

          // sorts by failed first
          newRows.sort((a, b) => {
            return a.status === b.status ? 0 : b.status ? -1 : 1;
          });

          setRows(newRows);
          onChange(newRows, 'validation');
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (spreadsheet && files) {
      fetchData().catch(console.error);
    }
  }, [spreadsheet, files]);

  const columns: GridColDef[] = [
    {
      field: 'fileName',
      headerName: 'File name',
      width: 250,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'File name'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        const color = params.row.status ? '__passed' : '__failed';
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom sx={{ color }} className={styles[`grid_row${color}`]}>
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
        const sx = params.row.brandNameError ? { color: '__failed' } : undefined;
        const className = params.row.brandNameError ? styles.grid_row__failed : undefined;
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom sx={sx} className={className}>
              {!params.row.brandNameError ? params.value : `Error: ${params.row.brandNameError}`}
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
        const sx = params.row.documentNumberError ? { color: '__failed' } : undefined;
        const className = params.row.documentNumberError ? styles.grid_row__failed : undefined;
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom sx={sx} className={className}>
              {!params.row.documentNumberError ? params.value : `Error: ${params.row.documentNumberError}`}
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
        const sx = params.row.documentTypeError ? { color: '__failed' } : undefined;
        const className = params.row.documentTypeError ? styles.grid_row__failed : undefined;
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom sx={sx} className={className}>
              {!params.row.documentTypeError ? params.value : `Error: ${params.row.documentTypeError}`}
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
        const sx = params.row.regionCountryError ? { color: '__failed' } : undefined;
        const className = params.row.regionCountryError ? styles.grid_row__failed : undefined;
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom sx={sx} className={className}>
              {params.value !== '' ? params.value : 'NA'}
              {params.row.regionCountryError ? (
                <>
                  <br />
                  {`Error: ${params.row.regionCountryError}`}
                </>
              ) : null}
            </Typography>
          </Box>
        );
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
        const sx = params.row.revisionError ? { color: '__failed' } : undefined;
        const className = params.row.revisionError ? styles.grid_row__failed : undefined;
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom sx={sx} className={className}>
              {!params.row.revisionError ? params.value : `Error: ${params.row.revisionError}`}
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
        const sx = params.row.languageError ? { color: '__failed' } : undefined;
        const className = params.row.languageError ? styles.grid_row__failed : undefined;
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom sx={sx} className={className}>
              {params.value !== '' ? params.value : 'NA'}
              {params.row.languageError ? (
                <>
                  <br />
                  {`Error: ${params.row.languageError}`}
                </>
              ) : null}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'cfn',
      headerName: 'CFNs',
      width: 350,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'CFN'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value && params.value !== '' ? params.value : `NA`}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'audience',
      headerName: 'Audience',
      width: 150,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Audience'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        const sx = params.row.audienceError ? { color: '__failed' } : undefined;
        const className = params.row.audienceError ? styles.grid_row__failed : undefined;
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom sx={sx} className={className}>
              {params.value}
              {params.row.audienceError ? (
                <>
                  <br />
                  {`Error: ${params.row.audienceError}`}
                </>
              ) : null}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'gtins',
      headerName: 'Custom GTINs',
      width: 350,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Custom GTINs'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value && params.value !== '' ? params.value : `NA`}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'definition',
      headerName: 'Custom Definition',
      width: 350,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Custom Definition'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value && params.value !== '' ? params.value : `NA`}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'description',
      headerName: 'Custom Description',
      width: 350,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Custom Description'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value && params.value !== '' ? params.value : `NA`}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderHeader: (params: GridColumnHeaderParams) => <strong>{'Status'}</strong>,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              {params.value ? (
                <Chip size="small" icon={<DoneIcon />} label="Passed" color="success" />
              ) : (
                <Chip size="small" icon={<ErrorOutlineIcon />} label="Failed" color="error" />
              )}
            </Typography>
          </Box>
        );
      }
    }
  ];

  return (
    <>
      <div className={styles['form-step']}>
        <div style={{ height: 500, width: '100%' }}>
          <DataGridPremium
            initialState={{ pinnedColumns: { left: ['fileName'], right: ['status'] } }}
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
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 15]}
          />
        </div>
      </div>
    </>
  );
};

// override of props to support formik
Validation.label = 'Validation';
Validation.initialValues = {};
Validation.validationSchema = object().shape({});

export default Validation;
