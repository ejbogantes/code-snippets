import React from 'react';
import NextImage from 'next/image';
import getConfig from 'next/config';
import { Grid, Typography } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { DropzoneArea } from 'mui-file-dropzone';
import styles from './index.module.scss';

// get public runtime settings
const {
  publicRuntimeConfig: { maxImageSizeUpload }
} = getConfig();

const Images = (props) => {
  const {
    formik,
    dropzoneState,
    logoDimensions,
    handleOnChangeDropzoneArea,
    handleOnCancelDropzoneArea,
    iconDimensions,
    dropzoneIconState,
    handleOnChangeDropzoneAreaIcon,
    handleOnCancelDropzoneAreaIcon
  } = props;

  return (
    <div className={styles['form-step']}>
      <Grid container spacing={1} sx={{ m: 0 }}>
        <Grid container direction="row" spacing={3}>
          <Grid item xs={12} md={6}>
            <DropzoneArea
              clearOnUnmount
              maxFileSize={maxImageSizeUpload}
              filesLimit={1}
              acceptedFiles={['image/jpeg', 'image/png', 'image/bmp']}
              showAlerts={false}
              alertSnackbarProps={{ anchorOrigin: { vertical: 'top', horizontal: 'right' } }}
              dropzoneClass={styles.dropzone__component}
              dropzoneParagraphClass={styles.dropzone__text}
              useChipsForPreview
              dropzoneText={dropzoneState.text}
              onChange={handleOnChangeDropzoneArea}
              onDelete={handleOnCancelDropzoneArea}
            />
            <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
              Recommended Dimensions: {logoDimensions.w} x {logoDimensions.h} px
            </Typography>
            {formik.touched.coLogo && Boolean(formik.errors.coLogo) && (
              <Typography variant="body2" color="error" sx={{ textAlign: 'center', marginTop: '10px' }}>
                <HighlightOffIcon fontSize="small" sx={{ marginBottom: '-4px' }} /> {formik.errors.coLogo}
              </Typography>
            )}

            {dropzoneState.imgSrc && (
              <div style={{ maxWidth: '150px', margin: 'auto', paddingTop: '20px' }}>
                <NextImage
                  src={dropzoneState.imgSrc}
                  alt="Logo image"
                  width={200}
                  height={100}
                  style={{ maxWidth: '200px', maxHeight: '100px' }}
                />
              </div>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <DropzoneArea
              clearOnUnmount
              maxFileSize={maxImageSizeUpload}
              filesLimit={1}
              acceptedFiles={['image/jpeg', 'image/png', 'image/bmp']}
              showAlerts={false}
              alertSnackbarProps={{ anchorOrigin: { vertical: 'top', horizontal: 'right' } }}
              dropzoneClass={styles.dropzone__component}
              dropzoneParagraphClass={styles.dropzone__text}
              useChipsForPreview
              dropzoneText={dropzoneIconState.text}
              onChange={handleOnChangeDropzoneAreaIcon}
              onDelete={handleOnCancelDropzoneAreaIcon}
            />
            <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
              Recommended Dimensions: {iconDimensions.w} x {iconDimensions.h} px
            </Typography>
            {formik.touched.coIcon && Boolean(formik.errors.coIcon) && (
              <Typography variant="body2" color="error" sx={{ textAlign: 'center', marginTop: '10px' }}>
                <HighlightOffIcon fontSize="small" sx={{ marginBottom: '-4px' }} /> {formik.errors.coIcon}
              </Typography>
            )}

            {dropzoneIconState.imgSrc && (
              <div style={{ maxWidth: '150px', margin: 'auto', paddingTop: '20px' }}>
                <NextImage
                  src={dropzoneIconState.imgSrc}
                  alt="Icon image"
                  width={150}
                  height={150}
                  style={{ maxWidth: '150px', maxHeight: '150px' }}
                />
              </div>
            )}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

Images.label = 'Images';

export default Images;
