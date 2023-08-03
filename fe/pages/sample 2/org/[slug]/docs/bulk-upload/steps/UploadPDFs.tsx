import styles from '../../bulk-upload/index.module.scss';

// react and next
import React, { useState } from 'react';
import getConfig from 'next/config';

// material ui
import { DropzoneArea } from 'mui-file-dropzone';
import { Typography, Box, Divider, Stack, Grid } from '@mui/material';

import { SoomSelect } from '@soom-universe/soom-ui';

// yup and others
import { object } from 'yup';

// get public runtime settings
const {
  publicRuntimeConfig: { maxFileSizeUpload }
} = getConfig();

// default dropzone text
const defaultDropzoneText = 'Drag & drop your PDF files here or click';

const UploadPDFs = ({ onChange, BUState, setBUState, databasesState, setDatabasesState }) => {
  // hooks
  const [dropzoneText, setDropzoneText] = useState(defaultDropzoneText);

  // this is to handle the file uploads
  const handleFileUpload = (e) => {
    if (e.length > 0) {
      setDropzoneText(`${e.length} files ready to upload!`);
      onChange(e, 'files');
    }
  };

  // on file upload cancel
  const onFileUploadCancel = () => {
    setDropzoneText(defaultDropzoneText);
    onChange(undefined, 'files');
  };

  return (
    <React.Fragment>
      <div className={styles['form-step']}>
        <Stack spacing={4} direction="column">
          <Grid container spacing={2} pt={2}>
            {BUState && BUState.show && (
              <Grid item sm={12} md={6}>
                <Box component="div" whiteSpace="normal">
                  <Typography variant="body2" gutterBottom>
                    Please select the business unit to which the PDF files belong.
                  </Typography>
                </Box>
                <Box component="div" whiteSpace="normal" sx={{ mt: '10px !important' }}>
                  <SoomSelect
                    widthAuto
                    dataTestId="businessUnitFilter"
                    ariaLabel="businessUnitFilterLabel"
                    options={BUState.options}
                    isMultiple={false}
                    id="businessUnitFilter"
                    name="businessUnitFilter"
                    label=""
                    value={BUState.selected}
                    onChange={(event) => {
                      if (event.target) {
                        setBUState({ ...BUState, selected: event.target.value });
                      }
                    }}
                  />
                </Box>
              </Grid>
            )}
            {databasesState && (
              <Grid item sm={12} md={6}>
                <Box component="div" whiteSpace="normal">
                  <Typography variant="body2" gutterBottom>
                    Please select a database to use.
                  </Typography>
                </Box>
                <Box component="div" whiteSpace="normal" sx={{ mt: '10px !important' }}>
                  <SoomSelect
                    widthAuto
                    dataTestId="databaseSelect"
                    ariaLabel="databaseSelectLabel"
                    options={databasesState.options}
                    isMultiple={false}
                    id="databaseSelect"
                    name="databaseSelect"
                    label=""
                    value={databasesState.selected}
                    onChange={(event) => {
                      if (event.target) {
                        setDatabasesState({ ...databasesState, selected: event.target.value });
                      }
                    }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>

          <Divider />

          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              Please select all the PDF files that you want to upload to the system. Make sure all files have the .pdf
              extension and all file names are correct.
            </Typography>
          </Box>
          <DropzoneArea
            data-test-id="dropzoneUploadPDF"
            maxFileSize={maxFileSizeUpload}
            filesLimit={50}
            acceptedFiles={['.pdf']}
            alertSnackbarProps={{ anchorOrigin: { vertical: 'top', horizontal: 'right' } }}
            useChipsForPreview
            onChange={handleFileUpload}
            onDelete={onFileUploadCancel}
            dropzoneText={dropzoneText}
            dropzoneClass={styles[`soom-dashboard-dropzone`]}
            dropzoneParagraphClass={styles['dropzone-text']}
            showAlerts={false}
          />
        </Stack>
      </div>
    </React.Fragment>
  );
};

// override of props to support formik
UploadPDFs.label = 'PDF Files';
UploadPDFs.initialValues = {};
UploadPDFs.validationSchema = object().shape({});

export default UploadPDFs;
