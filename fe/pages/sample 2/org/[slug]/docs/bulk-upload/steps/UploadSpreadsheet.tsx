// react and next
import React, { useState } from 'react';
import getConfig from 'next/config';
import Link from 'next/link';

// material ui
import { DropzoneArea } from 'mui-file-dropzone';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { object } from 'yup';
import styles from '../../bulk-upload/index.module.scss';

// get public runtime settings
const {
  publicRuntimeConfig: { maxFileSizeUpload }
} = getConfig();

// default dropzone text
const defaultDropzoneText = 'Drag & drop your Excel file here or click';

const UploadSpreadsheet = ({ onChange }) => {
  // hooks
  const [dropzoneText, setDropzoneText] = useState(defaultDropzoneText);

  // this is to handle the file uploads
  const handleFileUpload = (e) => {
    if (e.length > 0) {
      setDropzoneText(
        `Your data spreadsheet is ready to be uploaded. Click on NEXT to validate your PDF files against data.`
      );
      onChange(e[0], 'spreadsheet');
    }
  };

  // on file upload cancel
  const onFileUploadCancel = () => {
    setDropzoneText(defaultDropzoneText);
    onChange(undefined, 'spreadsheet');
  };

  return (
    <React.Fragment>
      <div className={styles['form-step']}>
        <Stack spacing={4} direction="column">
          <Box component="div" whiteSpace="normal">
            <Typography variant="body2" gutterBottom>
              Please select the data spreadsheet (Microsoft Excel spreadsheet) that you want to upload to the system.
              Make sure the files has the .xlsx extension and all data is correct and matches the PDF files selected in
              the previous step. You can download a template in the following link,
              <Link legacyBehavior href="/Soom-eIFU-Bulk-Upload-Template.xlsx" passHref>
                <a target={'_blank'}>
                  <strong> Soom eIFU Bulk Upload Template.</strong>
                </a>
              </Link>
            </Typography>
          </Box>
          <DropzoneArea
            data-test-id="dropzoneSpreadSheet"
            maxFileSize={maxFileSizeUpload}
            filesLimit={1}
            acceptedFiles={['.xlsx']}
            alertSnackbarProps={{ anchorOrigin: { vertical: 'top', horizontal: 'right' } }}
            useChipsForPreview
            onChange={handleFileUpload}
            onDelete={onFileUploadCancel}
            dropzoneText={dropzoneText}
            dropzoneClass={styles[`soom-dashboard-dropzone`]}
            dropzoneParagraphClass={styles['dropzone-text']}
          />
        </Stack>
      </div>
    </React.Fragment>
  );
};

// override of props to support formik
UploadSpreadsheet.label = 'Data Spreadsheet';
UploadSpreadsheet.initialValues = {};
UploadSpreadsheet.validationSchema = object().shape({});

export default UploadSpreadsheet;
