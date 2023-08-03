/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
// import styles from './index.module.scss';

// react and next stuff
import React, { useState, useEffect, useRef } from 'react';
import getConfig from 'next/config';
import Image from 'next/image';
import { getCookie, setCookie } from 'cookies-next';
import { get as _get, find as _find } from 'lodash';
import { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import parse from 'html-react-parser';

// material ui
import { Grid, Box, Stack, Alert, Fab } from '@mui/material';

// soom-ui
import { SoomSearch } from '@soom-universe/soom-ui';

// soom constants
import { audienceDefault } from '@soom-universe/soom-utils/constants';

// helpers
import { requestAutocomplete } from '../helpers/request';
import clientConfigLoader from '../helpers/clientConfigLoader';
import { getPageTranslation, Translation } from '../helpers/translation';

// components
import LangSelector from '../components/LangSelector';
import RegionSelector from '../components/RegionSelector';
import AudienceSelector from '../components/AudienceSelector';

// autocomplete manage vars
let autocompleteAbortController;
let autoCompleteTimeout = null;

// get public runtime settings
const {
  publicRuntimeConfig: { defaultLogo }
} = getConfig();

export function Index(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { config, company, welcomeText, translation, regionCookie, audienceCookie } = props;
  const translationHelper = new Translation(translation.data);

  const autoCompleteInputRef = useRef<HTMLInputElement>();

  const router = useRouter();
  const { locale, defaultLocale } = router;

  const languages = _get(company, 'languages', []);
  const selectedLanguage = _find(languages, (language) => {
    return language.value === locale;
  });

  const regions = _get(company, 'regions', []);
  const selectedRegion = _find(regions, (region) => {
    return region.value === regionCookie;
  });

  // autocomplete
  // const [autoCompleteLoading, setAutoCompleteLoading] = useState<boolean>(false);
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

  useEffect(() => {
    // auto focus autocomplete input
    if (autoCompleteInputRef.current) autoCompleteInputRef.current.focus();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.r) {
      setCookie('region', router.query.r);
    }
  }, [router.isReady]);

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

  const handleClickRegions = () => {
    setOpenRegions(true);
  };

  const handleSelectRegions = (value) => {
    setOpenRegions(false);
    setSelectedReg(value);
    setCookie('region', value.value);
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
  };

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '80vh' }}
    >
      <Grid item xs={3}>
        <Stack spacing={4}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            style={{ textAlign: 'center' }}
            sx={{
              height: 200
            }}
          >
            <Image
              src={company.logo && company.logo !== '' ? company.logo : defaultLogo}
              alt={company.SEOTitle ? company.SEOTitle : 'Web App Site'}
              width={400}
              height={200}
              priority={true}
            />
          </Box>
          <Box
            sx={{
              width: 600,
              maxWidth: '100%'
            }}
          >
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
              // searchButtonLoading={autoCompleteLoading}
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
                // setAutoCompleteLoading(true);
                // router.push(`/results/[searchTerm]`, `/results/${encodeURIComponent(searchValue)}`, { locale });
                const pathLocale = locale !== defaultLocale ? `/${locale}` : ``;
                window.location.href = `${pathLocale}/results?q=${encodeURIComponent(searchValue)}`;
              }}
              onChange={(_event: any, value: React.SetStateAction<string>, reason: string) => {
                setSearchValue(value);
                if (reason === 'input') getAutoCompleteData(value);
              }}
              onClose={(_e, _r) => {
                setAutoCompleteOpen(false);
              }}
            />
          </Box>
          <Alert severity="info" style={{ maxWidth: 600 }}>
            {welcomeText ? (
              parse(welcomeText)
            ) : (
              <>
                {translationHelper.get('alertText', '')} <b>{config.phoneNumber}</b>.
              </>
            )}
          </Alert>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
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
              redirect="/"
              items={company.languages}
              selectedValue={selectedLang}
              open={openLangs}
              onClick={handleClickLangs}
              onSelect={handleSelectLangs}
              onClose={handleCloseLangs}
            />

            {company.termsOfUseUrl && (
              <Fab
                size="small"
                variant="extended"
                disableRipple
                sx={{ textTransform: 'none', background: '#FFFFFF', borderRadius: '0', boxShadow: '0' }}
              >
                <a href={company.termsOfUseUrl} target="_blank" rel="noopener noreferrer">
                  {translationHelper.get('TOULabel', '')}
                </a>
              </Fab>
            )}
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}

// This gets called on every request
export const getServerSideProps = async (context) => {
  const clientConfig = await clientConfigLoader(context);
  const translation = await getPageTranslation('index', context.locale);
  const regionCookie = getCookie('region', { req: context.req, res: context.res }) || _get(context, 'query.r', null);
  const audienceCookie = getCookie('audience', { req: context.req, res: context.res }) || null;

  // welcome text
  const welcomeText = _get(clientConfig, `welcomeText.lang_${context.locale}`, null);

  // Pass data to the page via props
  return { props: { ...clientConfig, welcomeText, translation, regionCookie, audienceCookie } };
};

export default Index;
