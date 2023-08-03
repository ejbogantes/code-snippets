/* eslint-disable dot-notation */
/* eslint-disable react-hooks/exhaustive-deps */

// styles, react and nextjs
import styles from './index.module.scss';
import React, { useState, useEffect, useRef } from 'react';
import getConfig from 'next/config';
import { InferGetServerSidePropsType } from 'next';
import { getCookie, setCookie } from 'cookies-next';
import { get as _get, find as _find } from 'lodash';
import { useRouter } from 'next/router';
import Link from 'next/link';

// material ui
import {
  Box,
  Stack,
  Avatar,
  Grid,
  Divider,
  Card,
  CardContent,
  Typography,
  Fab,
  Collapse,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';

import {
  Pageview as PageviewIcon,
  Print as PrintIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Close as CloseIcon,
  WarningRounded as WarningRoundedIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
  Article as ArticleIcon
} from '@mui/icons-material';

// soom-ui
import {
  SoomSearch,
  SoomAlert,
  SoomButton,
  SoomTextField,
  SoomTypography,
  SoomLoader,
  SoomCheckbox
} from '@soom-universe/soom-ui';

// soom constants
import { audienceDefault } from '@soom-universe/soom-utils/constants';

// helpers
import clientConfigLoader from '../../helpers/clientConfigLoader';
import { requestAutocomplete, requestSearch, requestPrintedVersion } from '../../helpers/request';
import { getPageTranslation, Translation } from '../../helpers/translation';
import { getDocumentTypeLabel } from '../../helpers/documents';

// components
import LangSelector from '../../components/LangSelector';
import RegionSelector from '../../components/RegionSelector';
import AudienceSelector from '../../components/AudienceSelector';

// formik and yup
import * as yup from 'yup';
import { useFormik } from 'formik';

// autocomplete manage vars
let autocompleteAbortController;
let autoCompleteTimeout = null;

// get public runtime settings
const {
  publicRuntimeConfig: { defaultLogo }
} = getConfig();

// constants
// footer height margin
const footerHeightMargin = '180px';

const getDetailUrl = (id) => {
  return `detail/${id}`;
};

// change this to component
function ResultCardContent(props) {
  const { translation, title, description, date, type, safetyUpdate, fileName } = props;
  const translationHelper = new Translation(translation);

  return (
    <>
      <CardContent>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
          {safetyUpdate ? (
            <Tooltip
              slotProps={{ tooltip: { style: { margin: 0 } } }}
              title={
                <>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    <WarningAmberRoundedIcon fontSize="small" sx={{ mb: '-4px' }} />{' '}
                    {translationHelper.get('safetyUpdate.title', '')}
                  </Typography>
                  <Typography variant="body2">{translationHelper.get('safetyUpdate.message', '')}</Typography>
                </>
              }
            >
              <div>
                {title} <WarningRoundedIcon color="warning" sx={{ mb: '-4px' }} />
              </div>
            </Tooltip>
          ) : (
            title
          )}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1.5 }}>
          {description}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          {fileName}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          {translationHelper.get('labels.documentPublishedDate', '')}:{' '}
          {date || translationHelper.get('noDataLabels.NoPublishedDate', '')}
        </Typography>
        <Typography variant="body2">
          {translationHelper.get('labels.type', '')}: {type}
        </Typography>
      </CardContent>
    </>
  );
}

// change this to component
function ResultDetail(props) {
  const {
    showPrintedVersion,
    handleOnClickCollapseVersions,
    collapseVersionsIn,
    handleOpenSafetyDialog,
    handleOpenVersionDialog,
    translation,
    definition,
    manufacturer,
    gtin,
    cfn,
    documents,
    handleOpenModal
  } = props;
  const translationHelper = new Translation(translation);

  // get last version
  const firstDocument = documents[0];

  // remove last document to show versions
  const versions = [...documents];
  versions.shift();

  // display codes separated by comma
  let gtinLabel = translationHelper.get('noDataLabels.NoGTINs', '');
  let cfnLabel = translationHelper.get('noDataLabels.NoProductCodes', '');
  if (gtin && Array.isArray(gtin) && gtin.length > 0) {
    gtinLabel = gtin.join(', ');
  }
  if (cfn && Array.isArray(cfn) && cfn.length > 0) {
    cfnLabel = cfn.join(', ');
  }

  let collapseContent;
  if (versions.length > 0) {
    collapseContent = (
      <>
        <Typography variant="body2" component="div" style={{ padding: '0 15px' }}>
          {translationHelper.get('labels.revisionHistory', '')}
        </Typography>
        <Typography
          variant="body1"
          component="div"
          onClick={handleOnClickCollapseVersions}
          style={{ padding: '0 15px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {collapseVersionsIn ? (
            <KeyboardArrowUpIcon sx={{ verticalAlign: 'middle' }} />
          ) : (
            <KeyboardArrowDownIcon sx={{ verticalAlign: 'middle' }} />
          )}
          {versions.length}{' '}
          {versions.length > 1
            ? translationHelper.get('labels.versions', '')
            : translationHelper.get('labels.version', '')}
        </Typography>
        <Collapse in={collapseVersionsIn}>
          {versions.map((version, index) => {
            return (
              <DocVersionDetail
                key={`docVersionNum${index}`}
                showPrintedVersion={showPrintedVersion}
                handleOpenSafetyDialog={handleOpenSafetyDialog}
                handleOpenVersionDialog={handleOpenVersionDialog}
                translation={translation}
                document={version}
              />
            );
          })}
        </Collapse>
      </>
    );
  }

  return (
    <>
      <Grid item xs={12} sm={6} md={9}>
        <CardContent sx={{ paddingLeft: 5 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {translationHelper.get('labels.documentDefinition', '')}
          </Typography>
          <Typography variant="body2">{definition}</Typography>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mt: '15px' }}>
            {translationHelper.get('labels.documentManufacturer', '')}
          </Typography>
          <Typography variant="body2">{manufacturer}</Typography>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mt: '15px' }}>
            {translationHelper.get('labels.documentGtins', '')}
          </Typography>
          <Typography variant="body2" sx={{ maxHeight: '100px', overflowY: 'auto' }}>
            {gtinLabel}
          </Typography>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mt: '15px' }}>
            {translationHelper.get('labels.documentCfns', '')}
          </Typography>
          <Typography variant="body2" sx={{ maxHeight: '100px', overflowY: 'auto' }}>
            {cfnLabel}
          </Typography>
        </CardContent>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="stretch"
          sx={{
            height: '100%',
            background: '#444444',
            alignContent: 'center',
            color: '#FFFFFF'
          }}
        >
          <Divider />
          <Stack spacing={2} sx={{ width: '100%', padding: '20px 15px' }}>
            <Typography variant="body1" component="div" className={styles['soom-webapp__detail-sidebar-docname']}>
              {firstDocument.metadata.name}
            </Typography>
            <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
              <strong>{translationHelper.get('labels.documentNumber', '')}:</strong>{' '}
              {firstDocument.metadata.documentNumber}
            </Typography>
            <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
              <strong>{translationHelper.get('labels.documentType', '')}:</strong>{' '}
              {getDocumentTypeLabel(firstDocument.metadata.type)}
            </Typography>
            <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
              <strong>{translationHelper.get('labels.documentRevision', '')}:</strong> {firstDocument.metadata.revision}
            </Typography>
            <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
              <strong>{translationHelper.get('labels.documentRegion', '')}:</strong>{' '}
              {firstDocument.metadata.region ? firstDocument.metadata.region.join(', ').toUpperCase() : ''}
            </Typography>
            <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
              <strong>{translationHelper.get('labels.documentLanguage', '')}:</strong>{' '}
              {firstDocument.metadata.language ? firstDocument.metadata.language.join(', ') : ''}
            </Typography>
            <Fab
              size="small"
              color="primary"
              variant="extended"
              onClick={() => {
                if (firstDocument.metadata.safetyUpdate) {
                  handleOpenSafetyDialog(firstDocument, 'document', false);
                } else {
                  window.open(firstDocument.value, '_blank', 'noreferrer');
                }
              }}
              sx={{ zIndex: 99 }}
            >
              <PageviewIcon sx={{ mr: 1 }} />
              {translationHelper.get('labels.viewDocumentBtn', '')}
            </Fab>
            {showPrintedVersion && (
              <Fab
                size="small"
                color="primary"
                variant="extended"
                sx={{ zIndex: 99 }}
                onClick={() => {
                  if (firstDocument.metadata.safetyUpdate) {
                    handleOpenSafetyDialog(firstDocument, 'request', false);
                  } else {
                    handleOpenModal(firstDocument);
                  }
                }}
              >
                <PrintIcon sx={{ mr: 1 }} />
                {translationHelper.get('labels.requestPrintVersionBtn', '')}
              </Fab>
            )}
            <Fab
              size="small"
              color="primary"
              variant="extended"
              onClick={() => {
                if (firstDocument.metadata.safetyUpdate) {
                  handleOpenSafetyDialog(firstDocument, 'detail', false);
                } else {
                  const url = getDetailUrl(firstDocument.metadata.id);
                  window.open(url, '_blank', 'noreferrer');
                }
              }}
              sx={{ zIndex: 99 }}
            >
              <ArticleIcon sx={{ mr: 1 }} />
              {translationHelper.get('labels.viewDocumentDetailBtn', '')}
            </Fab>
            <Divider />
          </Stack>
          {collapseContent}
        </Grid>
      </Grid>
    </>
  );
}

// change this to component
function DocVersionDetail(props) {
  const { showPrintedVersion, handleOpenSafetyDialog, handleOpenVersionDialog, translation, document } = props;
  const translationHelper = new Translation(translation);

  return (
    <Stack spacing={2} sx={{ padding: '20px 15px' }}>
      <Divider />
      <Typography className={styles['soom-webapp__detail-sidebar-docname']} variant="body1" component="div">
        {document.metadata.name}
      </Typography>
      <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
        {translationHelper.get('labels.documentNumber', '')}: {document.metadata.documentNumber}
      </Typography>
      <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
        {translationHelper.get('labels.documentType', '')}: {getDocumentTypeLabel(document.metadata.type)}
      </Typography>
      <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
        {translationHelper.get('labels.documentRevision', '')}: {document.metadata.revision}
      </Typography>
      <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
        {translationHelper.get('labels.documentRegion', '')}:{' '}
        {document.metadata.region ? document.metadata.region.join(', ').toUpperCase() : ''}
      </Typography>
      <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
        {translationHelper.get('labels.documentLanguage', '')}:{' '}
        {document.metadata.language ? document.metadata.language.join(', ') : ''}
      </Typography>
      <Typography variant="body2" component="div" style={{ marginTop: '5px' }}>
        {translationHelper.get('labels.documentPublishedDate', '')}: {document.metadata.publishedDate}
      </Typography>
      <Fab
        size="small"
        color="primary"
        variant="extended"
        onClick={() => {
          if (document.metadata.safetyUpdate) {
            handleOpenSafetyDialog(document, 'document', true);
          } else {
            handleOpenVersionDialog(document, 'document');
          }
        }}
        sx={{ zIndex: 99 }}
      >
        <PageviewIcon sx={{ mr: 1 }} />
        {translationHelper.get('labels.viewDocumentBtn', '')}
      </Fab>

      {showPrintedVersion && (
        <Fab
          size="small"
          color="primary"
          variant="extended"
          onClick={() => {
            if (document.metadata.safetyUpdate) {
              handleOpenSafetyDialog(document, 'request', true);
            } else {
              handleOpenVersionDialog(document, 'request');
            }
          }}
          sx={{ zIndex: 99 }}
        >
          <PrintIcon sx={{ mr: 1 }} />
          {translationHelper.get('labels.requestPrintVersionBtn', '')}
        </Fab>
      )}

      <Fab
        size="small"
        color="primary"
        variant="extended"
        onClick={() => {
          if (document.metadata.safetyUpdate) {
            handleOpenSafetyDialog(document, 'detail', true);
          } else {
            handleOpenVersionDialog(document, 'detail');
          }
        }}
        sx={{ zIndex: 99 }}
      >
        <ArticleIcon sx={{ mr: 1 }} />
        {translationHelper.get('labels.viewDocumentDetailBtn', '')}
      </Fab>
      <Divider />
    </Stack>
  );
}

// change this to component
function FormModal(props) {
  const { translation, formModalState, formModalAlertState, formik, handleCloseModal } = props;
  const translationHelper = new Translation(translation);

  if (formModalState.document === null) {
    return null;
  }

  return (
    <Modal open={formModalState.open} onClose={handleCloseModal} aria-labelledby="modal-modal-title">
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, -10%)',
          width: 800,
          bgcolor: 'background.paper',
          border: '1px solid #E8E8E8',
          borderRadius: '4px',
          p: 2,
          maxHeight: `calc(100vh - 100px)`,
          overflowY: 'auto'
        }}
      >
        <DialogTitle id="modal-modal-title" sx={{ py: 0, overflow: 'hidden' }}>
          <Typography variant="h5" component="div" sx={{ float: 'left' }}>
            {translationHelper.get('title', '')}
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ float: 'right' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item md={12} xs={12}>
              <DialogContentText>
                {translationHelper.get('description.preDocName', '')}{' '}
                <strong>&quot;{formModalState.document.metadata.name}&quot;</strong>
                {translationHelper.get('description.posDocName', '')}
              </DialogContentText>
              <DialogContentText>
                <small>{translationHelper.get('smallDescription', '')}</small>
              </DialogContentText>
            </Grid>
            <Grid item md={12} xs={12}>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="firstName"
                      ariaLabel="First Name"
                      id="firstName"
                      name="firstName"
                      variant="outlined"
                      label={translationHelper.get('labels.firstName', '')}
                      placeholder={translationHelper.get('placeholders.firstName', '')}
                      required={true}
                      value={formik.values.firstName}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="lastName"
                      ariaLabel="Last Name"
                      id="lastName"
                      name="lastName"
                      variant="outlined"
                      label={translationHelper.get('labels.lastName', '')}
                      placeholder={translationHelper.get('placeholders.lastName', '')}
                      required={true}
                      value={formik.values.lastName}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="phone"
                      ariaLabel="Phone"
                      id="phone"
                      name="phone"
                      variant="outlined"
                      label={translationHelper.get('labels.phone', '')}
                      placeholder={translationHelper.get('placeholders.phone', '')}
                      required={true}
                      value={formik.values.phone}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="email"
                      ariaLabel="Email"
                      id="email"
                      name="email"
                      variant="outlined"
                      label={translationHelper.get('labels.email', '')}
                      placeholder={translationHelper.get('placeholders.email', '')}
                      required={true}
                      value={formik.values.email}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="street"
                      ariaLabel="Street"
                      id="street"
                      name="street"
                      variant="outlined"
                      label={translationHelper.get('labels.street', '')}
                      placeholder={translationHelper.get('placeholders.street', '')}
                      required={true}
                      value={formik.values.street}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.street && Boolean(formik.errors.street)}
                      helperText={formik.touched.street && formik.errors.street}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="city"
                      ariaLabel="City"
                      id="city"
                      name="city"
                      variant="outlined"
                      label={translationHelper.get('labels.city', '')}
                      placeholder={translationHelper.get('placeholders.city', '')}
                      required={true}
                      value={formik.values.city}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.city && Boolean(formik.errors.city)}
                      helperText={formik.touched.city && formik.errors.city}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="state"
                      ariaLabel="State"
                      id="state"
                      name="state"
                      variant="outlined"
                      label={translationHelper.get('labels.state', '')}
                      placeholder={translationHelper.get('placeholders.state', '')}
                      required={true}
                      value={formik.values.state}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.state && Boolean(formik.errors.state)}
                      helperText={formik.touched.state && formik.errors.state}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="country"
                      ariaLabel="Country"
                      id="country"
                      name="country"
                      variant="outlined"
                      label={translationHelper.get('labels.country', '')}
                      placeholder={translationHelper.get('placeholders.country', '')}
                      required={true}
                      value={formik.values.country}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.country && Boolean(formik.errors.country)}
                      helperText={formik.touched.country && formik.errors.country}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <SoomTextField
                      fullWidth
                      dataTestId="postalCode"
                      ariaLabel="Postal Code"
                      id="postalCode"
                      name="postalCode"
                      variant="outlined"
                      label={translationHelper.get('labels.postalCode', '')}
                      placeholder={translationHelper.get('placeholders.postalCode', '')}
                      required={true}
                      value={formik.values.postalCode}
                      handlerOnChange={formik.handleChange}
                      handlerOnBlur={formik.handleBlur}
                      error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
                      helperText={formik.touched.postalCode && formik.errors.postalCode}
                      disabled={formik.isSubmitting}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <SoomCheckbox
                      label={translationHelper.get('labels.consent', '')}
                      labelPlacement="end"
                      size="medium"
                      defaultChecked={formik.values.consent}
                      handlerOnChange={(event, checked) => {
                        formik.setFieldValue('consent', checked);
                      }}
                      handlerOnBlur={() => {
                        formik.setFieldTouched('consent', true);
                      }}
                      error={formik.touched.consent && Boolean(formik.errors.consent)}
                      helperText={formik.touched.consent && formik.errors.consent}
                    />
                  </Grid>
                </Grid>
                <Divider style={{ margin: '10px 0' }} />
                {formModalAlertState.open && (
                  <Grid container spacing={2}>
                    <Grid item md={12} xs={12} className={styles['soom-webapp__form-alert-container']}>
                      <SoomAlert ariaLabel="AlertDiv" severity={formModalAlertState.type}>
                        <SoomTypography
                          ariaLabel="AlertMessage"
                          text={formModalAlertState.message}
                          variant="body1"
                          component="span"
                        />
                      </SoomAlert>
                    </Grid>
                  </Grid>
                )}
                <div className={styles.buttons__container} style={{ margin: '15px 0' }}>
                  <SoomButton
                    dataTestId="btnCancel"
                    ariaLabel="Cancel"
                    variant="outlined"
                    handlerOnClick={handleCloseModal}
                    label={translationHelper.get('buttonCancelText', '')}
                    type="button"
                    disabled={formik.isSubmitting}
                  />{' '}
                  <SoomButton
                    dataTestId="btnSubmit"
                    ariaLabel="Request Version"
                    variant="contained"
                    handlerOnClick={formik.handleSubmit}
                    label={translationHelper.get('buttonSubmitText', '')}
                    type="submit"
                    loading={formik.isSubmitting}
                    disabled={!(formik.isValid && formik.dirty)}
                  />
                </div>
                <Divider style={{ margin: '10px 0' }} />
                <DialogContentText>
                  {translationHelper.get('privacyPolicy.preLinkText', '')}
                  <a
                    style={{ textDecoration: 'underline' }}
                    target="_blank"
                    href={translationHelper.get('privacyPolicy.linkUrl', '')}
                    rel="noopener noreferrer"
                  >
                    <strong>{translationHelper.get('privacyPolicy.linkText', '')}</strong>
                  </a>
                  {translationHelper.get('privacyPolicy.posLinkText', '')}
                </DialogContentText>
              </form>
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
    </Modal>
  );
}

export function Results(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { config, company, features, translation, regionCookie, audienceCookie } = props;
  const translationHelper = new Translation(translation.data);

  const resultDetailRef = useRef<HTMLDivElement>();
  const autoCompleteInputRef = useRef<HTMLInputElement>();

  const router = useRouter();
  const { locale } = router;

  const languages = _get(company, 'languages', []);
  const selectedLanguage = _find(languages, (language) => {
    return language.value === locale;
  });

  const regions = _get(company, 'regions', []);
  const selectedRegion = _find(regions, (region) => {
    return region.value === regionCookie;
  });

  // data
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);

  // autocomplete
  const [autoCompleteOpen, setAutoCompleteOpen] = useState<boolean>(false);
  const [autoCompleteData, setAutoCompleteData] = useState([]);
  const [searchValue, setSearchValue] = useState<string>('');

  // languages
  const [openLangs, setOpenLangs] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState(selectedLanguage || languages[0]);

  // countries/regions
  const [openRegions, setOpenRegions] = useState<boolean>(!regionCookie);
  const [selectedReg, setSelectedReg] = useState(selectedRegion || regions[0]);

  // audience
  const [openAudience, setOpenAudience] = useState<boolean>(!audienceCookie);
  const [selectedAudience, setSelectedAudience] = useState(audienceCookie || audienceDefault);

  // results
  const [heightResultDetail, setHeightResultDetail] = useState(`calc(100vh - ${footerHeightMargin})`);
  const [collapseVersionsIn, setCollapseVersionsIn] = React.useState(false);

  // modal
  const [formModalState, setFormModalState] = useState({ open: false, document: null });
  const [formModalAlertState, setFormModalAlertState] = useState({
    open: false,
    type: 'success',
    message: ''
  });

  // dialog
  const [safetyDialogState, setSafetyDialogState] = useState({
    open: false,
    document: null,
    type: 'document',
    openDialog: false
  });
  const [versionDialogState, setVersionDialogState] = useState({
    open: false,
    document: null,
    type: 'document'
  });

  // products data
  const [productsData, setProductsData] = useState([]);
  const [productIndexSelected, setProductIndexSelected] = useState(0);
  const [productSelected, setProductSelected] = useState(null);

  useEffect(() => {
    // auto focus autocomplete input
    if (autoCompleteInputRef.current) autoCompleteInputRef.current.focus();
    // update 'height' when the window resizes
    window.addEventListener('resize', getHeightResultDetail);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    // get search value from query when router is ready
    const querySearchValue = router.query.q ? router.query.q.toString() : '';
    // load search value in autocomplete
    setSearchValue(querySearchValue);
    // load products with search value
    fetchProductsData(querySearchValue);
  }, [router.isReady]);

  useEffect(() => {
    if (!searchValue) return;
    // load products with search value
    fetchProductsData();
  }, [locale]);

  useEffect(() => {
    // get 'height' after the initial render and every time the doc selected change
    getHeightResultDetail();
    // close versions collapse when product select change
    setCollapseVersionsIn(false);
  }, [productSelected]);

  function getAutoCompleteData(search) {
    clearTimeout(autoCompleteTimeout);
    autoCompleteTimeout = setTimeout(() => {
      fetchAutoCompleteData(search);
    }, 1000);
  }

  const fetchAutoCompleteData = async (search) => {
    setAutoCompleteData([]);
    setAutoCompleteOpen(true);

    let region;
    if (regions.length > 0) {
      region = selectedReg.value;
    }

    let audience = audienceDefault;
    if (config.doctorAudience) {
      audience = selectedAudience;
    }

    autocompleteAbortController = new AbortController();
    const autoCompleteResults = await requestAutocomplete(
      {
        bucket: config.bucketName,
        searchTerm: search,
        region,
        audience,
        limit: 5
      },
      { 'Accept-Language': locale },
      autocompleteAbortController.signal
    );
    setAutoCompleteData(autoCompleteResults);
    setAutoCompleteOpen(autoCompleteResults.length > 0);
  };

  const cancelFetchAutocomplete = () => {
    if (autocompleteAbortController) autocompleteAbortController.abort();
    clearTimeout(autoCompleteTimeout);
    setAutoCompleteOpen(false);
    setAutoCompleteData([]);
  };

  const fetchProductsData = async (search?, regionCode?, audienceSelected?) => {
    setProductsData([]);
    setIsLoadingProducts(true);

    const searchTerm = search || searchValue;

    let region;
    if (regions.length > 0) {
      region = regionCode || selectedReg.value;
    }

    let audience = audienceDefault;
    if (config.doctorAudience) {
      audience = audienceSelected || selectedAudience;
    }

    const productsResults = await requestSearch(
      {
        language: locale,
        region, // only if has regions
        audience,
        searchTerm,
        filterBy: 'bucket',
        filterValue: config.bucketName,
        orderBy: 'publishedDate',
        order: 'desc'
      },
      { 'Accept-Language': locale }
    );
    const firstProduct = productsResults[0] || null;

    setProductsData(productsResults);
    setProductSelected(firstProduct);
    setIsLoadingProducts(false);

    // focus autocomplete input
    if (autoCompleteInputRef.current) autoCompleteInputRef.current.focus();
  };

  const getHeightResultDetail = () => {
    if (resultDetailRef && resultDetailRef.current) {
      const newHeight = resultDetailRef.current['clientHeight'];
      setHeightResultDetail(`${newHeight}px`);
    }
  };

  const handleClickRegions = () => {
    setOpenRegions(true);
  };

  const handleSelectRegions = (value) => {
    setOpenRegions(false);
    setSelectedReg(value);
    setCookie('region', value.value);
    fetchProductsData(searchValue, value.value, selectedAudience);
  };

  const handleCloseRegions = (value) => {
    setOpenRegions(false);
  };

  const handleClickLangs = () => {
    setOpenLangs(true);
  };

  const handleSelectLangs = (value) => {
    setOpenLangs(false);
    setSelectedLang(value);
  };

  const handleCloseLangs = (value) => {
    setOpenLangs(false);
  };

  const handleClickAudience = () => {
    setOpenAudience(true);
  };

  const handleCloseAudience = (value) => {
    setOpenAudience(false);
    setSelectedAudience(value.value);
    setCookie('audience', value.value);
    fetchProductsData(searchValue, selectedReg.value, value.value);
  };

  const handleOnClickDocument = (selectedIndex) => {
    setProductIndexSelected(selectedIndex);
    setProductSelected(productsData[selectedIndex]);
  };

  const handleOpenSafetyDialog = (document, type = 'document', openDialog = false) => {
    setSafetyDialogState({ open: true, document, type, openDialog });
  };

  const handleCloseSafetyDialog = () => {
    setSafetyDialogState({ open: false, document: null, type: 'document', openDialog: false });
  };

  const handleCloseSafetyDialogOpenVersionDialog = async () => {
    const document = safetyDialogState.document;
    const type = safetyDialogState.type;
    await setSafetyDialogState({ open: false, document: null, type: 'document', openDialog: false });
    handleOpenVersionDialog(document, type);
  };

  const handleCloseSafetyDialogOpenModal = async () => {
    const document = safetyDialogState.document;
    await setSafetyDialogState({ open: false, document: null, type: 'document', openDialog: false });
    handleOpenModal(document);
  };

  const handleOpenVersionDialog = (document, type = 'document') => {
    setVersionDialogState({ open: true, document, type });
  };

  const handleCloseVersionDialog = () => {
    setVersionDialogState({ open: false, document: null, type: 'document' });
  };

  const handleCloseVersionDialogOpenModal = async () => {
    const document = versionDialogState.document;
    await setVersionDialogState({ open: false, document: null, type: 'document' });
    handleOpenModal(document);
  };

  const handleOpenModal = (document) => {
    setFormModalState({ open: true, document });
  };

  const handleCloseModal = () => {
    setFormModalState({ open: false, document: null });
    formModalFormik.resetForm();
  };

  const handleOnClickCollapseVersions = () => {
    setCollapseVersionsIn(!collapseVersionsIn);
  };

  // formik
  const formModalFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      consent: false
    },
    validationSchema: yup.object({
      firstName: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.firstName', '')),
      lastName: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.lastName', '')),
      phone: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.phone', '')),
      email: yup
        .string()
        .required(translationHelper.get('common.requestPrintedForm.validations.email', ''))
        .email(translationHelper.get('common.requestPrintedForm.validations.invalidEmail', '')),
      street: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.street', '')),
      city: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.city', '')),
      state: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.state', '')),
      country: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.country', '')),
      postalCode: yup.string().required(translationHelper.get('common.requestPrintedForm.validations.postalCode', '')),
      consent: yup.bool().oneOf([true], translationHelper.get('common.requestPrintedForm.validations.consent', ''))
    }),
    onSubmit: async (values) => {
      const { metadata, value } = formModalState.document;

      const params = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        email: values.email,
        street: values.street,
        city: values.city,
        state: values.state,
        country: values.country,
        postalCode: values.postalCode,
        documentName: metadata.name,
        documentRevision: metadata.revision,
        documentNumber: metadata.documentNumber,
        documentLanguage: metadata.language ? metadata.language.join(',') : 'No language',
        documentGtin: productSelected.gtin ? productSelected.gtin.join(',') : 'No GTIN',
        documentPublishedDate: metadata.publishedDate,
        documentUrl: value
      };
      const headers = { 'Accept-Language': locale };

      try {
        const requestPrintedVersionResult = await requestPrintedVersion(params, headers);
        if (requestPrintedVersionResult) {
          // show success alert
          setFormModalAlertState({
            ...formModalAlertState,
            open: true,
            type: 'success',
            message: translationHelper.get('common.requestPrintedForm.messages.success', '')
          });
          // reset form
          formModalFormik.resetForm();
          // close modal after 3 seconds
          setTimeout(() => {
            handleCloseModal();
            setFormModalAlertState({
              ...formModalAlertState,
              open: false
            });
          }, 3000);
        } else {
          // show error alert
          setFormModalAlertState({
            ...formModalAlertState,
            open: true,
            type: 'error',
            message: translationHelper.get('common.requestPrintedForm.messages.error', '')
          });
        }
      } catch (error) {
        // console.error(error);
        // show error alert
        setFormModalAlertState({
          ...formModalAlertState,
          open: true,
          type: 'error',
          message: translationHelper.get('common.requestPrintedForm.messages.error', '')
        });
      }
    }
  });

  let resultContent = null;
  if (isLoadingProducts) {
    resultContent = (
      <Grid container>
        <Grid item xs={12}>
          <SoomLoader type="linear" color="primary"></SoomLoader>
        </Grid>
      </Grid>
    );
  } else if (productsData.length <= 0) {
    resultContent = (
      <Grid container spacing={0}>
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {translationHelper.get('noResults', '')}
          </Typography>
        </Grid>
      </Grid>
    );
  } else {
    const firstDocumentProductSelected = productSelected.documents[0];
    resultContent = (
      <Grid container spacing={0}>
        <Grid item xs={12} sm={3} sx={{ maxHeight: heightResultDetail, overflowY: 'auto' }}>
          <Stack spacing={2}>
            {productsData.map((info, index) => {
              const firstDocument = info.documents[0];
              const selectedStyles =
                index === productIndexSelected ? { background: '#E8E8E8', border: 'none', borderRadius: 0 } : {};
              const sx = { cursor: 'pointer' };
              return (
                <Card
                  key={`resultNum${index}`}
                  sx={{ ...sx, ...selectedStyles }}
                  onClick={() => handleOnClickDocument(index)}
                >
                  <ResultCardContent
                    translation={translationHelper.get('common.documentDetail', {})}
                    title={
                      firstDocument.metadata.brandName
                        ? firstDocument.metadata.brandName
                        : translationHelper.get('common.documentDetail.noDataLabels.noBrandName', '')
                    }
                    description={
                      firstDocument.metadata.description
                        ? firstDocument.metadata.description
                        : translationHelper.get('common.documentDetail.noDataLabels.noDescription', '')
                    }
                    date={firstDocument.metadata.publishedDate}
                    type={getDocumentTypeLabel(firstDocument.metadata.type)}
                    safetyUpdate={firstDocument.metadata.safetyUpdate}
                    fileName={firstDocument.metadata.name}
                  />
                </Card>
              );
            })}
          </Stack>
        </Grid>
        <Grid item xs={12} sm={9} sx={{ background: '#E8E8E8' }}>
          <Grid container spacing={0} sx={{ minHeight: `calc(100vh - ${footerHeightMargin})` }} ref={resultDetailRef}>
            <ResultDetail
              showPrintedVersion={features.showPrintedVersion}
              handleOnClickCollapseVersions={handleOnClickCollapseVersions}
              collapseVersionsIn={collapseVersionsIn}
              handleOpenSafetyDialog={handleOpenSafetyDialog}
              handleOpenVersionDialog={handleOpenVersionDialog}
              translation={translationHelper.get('common.documentDetail', '')}
              definition={
                firstDocumentProductSelected.metadata.definition
                  ? firstDocumentProductSelected.metadata.definition
                  : translationHelper.get('common.documentDetail.noDataLabels.noDefinition', '')
              }
              manufacturer={firstDocumentProductSelected.metadata.manufacturer}
              gtin={firstDocumentProductSelected.metadata.gtin}
              cfn={firstDocumentProductSelected.metadata.cfn}
              documents={[...productSelected.documents]}
              handleOpenModal={handleOpenModal}
            />
          </Grid>
        </Grid>
      </Grid>
    );
  }

  return (
    <Box sx={{ width: '100%', padding: 2, marginBottom: 4 }}>
      <div style={{ visibility: 'hidden', fontSize: '1px', margin: '0px', position: 'absolute' }}>
        <SoomTypography component="h1" variant="h1" text={`${company.SEOTitle} Search Results`} />
      </div>

      <Stack spacing={2} alignItems="center">
        <Grid container spacing={3} columns={12}>
          <Grid item xs={8}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Link legacyBehavior key={locale} href="/" locale={locale}>
                <Avatar
                  alt={company.SEOTitle ? company.SEOTitle : 'Web App Site'}
                  src={company.logo && company.logo !== '' ? company.logo : defaultLogo}
                  sx={{ height: '100px', width: 'auto' }}
                  style={{ alignSelf: 'center', cursor: 'pointer' }}
                  variant="square"
                />
              </Link>
              <Stack width={'100%'}>
                <SoomSearch
                  open={autoCompleteOpen}
                  inputRef={autoCompleteInputRef}
                  autoComplete
                  size="medium"
                  options={autoCompleteData}
                  fullWidth
                  freeSolo
                  loading
                  loadingText={translationHelper.get('autocomplete.loadingText', '')}
                  autoHighlight
                  disableClearable
                  clearOnEscape
                  blurOnSelect
                  searchButtonText={translationHelper.get('autocomplete.buttonText', '')}
                  searchButtonVariant="contained"
                  searchButtonColor="primary"
                  searchButtonSize="medium"
                  placeholder={translationHelper.get('autocomplete.inputPlaceholder', '')}
                  searchIcon
                  variant="standard"
                  disabledButton={searchValue === ''}
                  key="soom-search-autocomplete"
                  inputValue={searchValue}
                  onSearch={() => {
                    cancelFetchAutocomplete();
                    router.push(
                      `/results?q=${encodeURIComponent(searchValue)}`,
                      `/results?q=${encodeURIComponent(searchValue)}`,
                      { locale }
                    );
                    fetchProductsData();
                  }}
                  onChange={(_event, value, reason) => {
                    setSearchValue(value);
                    if (reason === 'input') getAutoCompleteData(value);
                  }}
                  onClose={(_e, _r) => {
                    setAutoCompleteOpen(false);
                  }}
                />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={4} textAlign="right">
            {config.doctorAudience && (
              <AudienceSelector
                translationHelper={translationHelper}
                selectedValue={selectedAudience}
                open={openAudience}
                onClick={handleClickAudience}
                onClose={handleCloseAudience}
              />
            )}

            {regions.length > 0 && (
              <RegionSelector
                title={translationHelper.get('common.labels.countrySelectTitle', '')}
                items={company.regions}
                selectedValue={selectedReg}
                open={openRegions}
                onClick={handleClickRegions}
                onSelect={handleSelectRegions}
                onClose={handleCloseRegions}
              />
            )}
            <LangSelector
              title={translationHelper.get('common.labels.languageSelectTitle', '')}
              redirect={`/results?q=${encodeURIComponent(searchValue)}`}
              items={company.languages}
              selectedValue={selectedLang}
              open={openLangs}
              onClick={handleClickLangs}
              onSelect={handleSelectLangs}
              onClose={handleCloseLangs}
            />
          </Grid>
        </Grid>
        {resultContent}
      </Stack>
      {features.showPrintedVersion && (
        <FormModal
          translation={translationHelper.get('common.requestPrintedForm', {})}
          formModalState={formModalState}
          formModalAlertState={formModalAlertState}
          formik={formModalFormik}
          handleCloseModal={handleCloseModal}
        />
      )}
      <Dialog
        fullWidth
        open={safetyDialogState.open}
        onClose={handleCloseSafetyDialog}
        aria-labelledby="safety-update-dialog-title"
        aria-describedby="safety-update-dialog-description"
      >
        <DialogTitle id="safety-update-dialog-title" style={{ padding: '15px' }}>
          <WarningAmberRoundedIcon sx={{ mb: '-4px' }} />{' '}
          {translationHelper.get('common.documentDetail.safetyUpdate.title', '')}
        </DialogTitle>
        <Divider />
        <DialogContent style={{ padding: '15px' }}>
          <DialogContentText id="safety-update-dialog-description">
            {translationHelper.get('common.documentDetail.safetyUpdate.message', '')}
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: '15px' }}>
          <div className={styles.buttons__container} style={{ margin: '0' }}>
            <Button variant="outlined" onClick={handleCloseSafetyDialog}>
              {translationHelper.get('common.documentDetail.safetyUpdate.closeBtn', '')}
            </Button>{' '}
            <Button
              variant="contained"
              onClick={() => {
                if (safetyDialogState.openDialog) {
                  handleCloseSafetyDialogOpenVersionDialog();
                } else if (safetyDialogState.type === 'request') {
                  handleCloseSafetyDialogOpenModal();
                } else if (safetyDialogState.type === 'detail') {
                  const url = getDetailUrl(safetyDialogState.document.metadata.id);
                  window.open(url, '_blank', 'noreferrer');
                  setTimeout(() => {
                    handleCloseSafetyDialog();
                  }, 1000);
                } else {
                  window.open(safetyDialogState.document.value, '_blank', 'noreferrer');
                  setTimeout(() => {
                    handleCloseSafetyDialog();
                  }, 1000);
                }
              }}
            >
              {translationHelper.get('common.documentDetail.safetyUpdate.continueBtn', '')}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        open={versionDialogState.open}
        onClose={handleCloseVersionDialog}
        aria-labelledby="safety-update-dialog-title"
        aria-describedby="safety-update-dialog-description"
      >
        <DialogTitle id="safety-update-dialog-title" style={{ padding: '15px' }}>
          <WarningAmberRoundedIcon sx={{ mb: '-4px' }} />{' '}
          {translationHelper.get('common.documentDetail.oldVersion.title', '')}
        </DialogTitle>
        <Divider />
        <DialogContent style={{ padding: '15px' }}>
          <DialogContentText id="safety-update-dialog-description">
            {translationHelper.get('common.documentDetail.oldVersion.message', '')}
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: '15px' }}>
          <div className={styles.buttons__container} style={{ margin: '0' }}>
            <Button variant="outlined" onClick={handleCloseVersionDialog}>
              {translationHelper.get('common.documentDetail.oldVersion.noBtn', '')}
            </Button>{' '}
            <Button
              variant="contained"
              onClick={() => {
                if (versionDialogState.type === 'request') {
                  handleCloseVersionDialogOpenModal();
                } else if (versionDialogState.type === 'detail') {
                  const url = getDetailUrl(versionDialogState.document.metadata.id);
                  window.open(url, '_blank', 'noreferrer');
                  setTimeout(() => {
                    handleCloseVersionDialog();
                  }, 1000);
                } else {
                  window.open(versionDialogState.document.value, '_blank', 'noreferrer');
                  setTimeout(() => {
                    handleCloseVersionDialog();
                  }, 1000);
                }
              }}
            >
              {translationHelper.get('common.documentDetail.oldVersion.yesBtn', '')}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// This gets called on every request
export const getServerSideProps = async (context) => {
  const clientConfig = await clientConfigLoader(context);
  const translation = await getPageTranslation('results', context.locale);
  const regionCookie = getCookie('region', { req: context.req, res: context.res }) || null;
  const audienceCookie = getCookie('audience', { req: context.req, res: context.res }) || null;

  // welcome text
  delete clientConfig.welcomeText;

  // Pass data to the page via props
  return { props: { ...clientConfig, translation, regionCookie, audienceCookie } };
};

export default Results;
