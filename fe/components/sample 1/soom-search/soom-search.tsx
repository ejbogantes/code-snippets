/* eslint-disable dot-notation */
import React, { MutableRefObject } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from '@mui/lab/LoadingButton';
import SearchIcon from '@mui/icons-material/Search';
import styles from './soom-search.module.scss';

export interface SoomSearchProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
  /**
   * This field it's to indicate if the input have autocomplete
   */
  autoComplete?: boolean;
  /**
   *
   */
  autoHighlight?: boolean;

  autoSelect?: boolean;
  /**
   *
   */
  blurOnSelect?: boolean;
  /**
   *
   */
  clearOnEscape?: boolean;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId?: string;
  /**
   *
   */
  disableClearable?: boolean;
  /**
   * This field it's to indicate if the button in the component is allow to click or not
   */
  disabledButton?: boolean;
  /**
   *
   */
  freeSolo?: boolean;
  /**
   * This field it's to indicate if the component will have full width
   */
  fullWidth?: boolean;
  /**
   *
   */
  inputValue?: string;
  /**
   *
   */
  loading?: boolean;
  limitTags?: number;
  /**
   *
   */
  onChange(event: React.SyntheticEvent, value: string, reason?: string): void;
  onSearch(value: string | undefined): void;
  options: readonly unknown[];
  /**
   *
   */
  placeholder?: string;
  /**
   *
   */
  loadingText?: string;
  /**
   *
   */
  searchButtonLoading?: boolean;
  /**
   *
   */
  searchButtonText?: string;
  /**
   *
   */
  searchButtonColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  /**
   * This field it's using to indicate the size of the button
   */
  searchButtonSize?: 'small' | 'medium' | 'large';
  /**
   * This field it's using to indicate the form of the button
   */
  searchButtonVariant?: 'text' | 'outlined' | 'contained';
  /**
   * This field it's to indicate if the component have a search icon
   */
  searchIcon?: boolean;
  /**
   *
   */
  size: 'small' | 'medium';
  /**
   *
   */
  sx?: object;
  /**
   *
   */
  variant?: 'standard' | 'filled' | 'outlined';
  /**
   * This field it's using to indicate the width of the component
   */
  width?: string;
  /**
   *
   */
  inputRef?: MutableRefObject<HTMLInputElement>;
  /**
   * is open
   */
  open?: boolean;
  /**
   * is close
   */
  onClose?(event: React.SyntheticEvent, reason: string): void;
}

export function SoomSearch(props: SoomSearchProps) {
  const sx = { maxWidth: '100%', ...props.sx };
  const style = { width: 'auto' };
  if (props.width) {
    style.width = props.width;
  }
  return (
    <Box sx={{ ...sx }} style={style}>
      <Autocomplete
        openOnFocus
        selectOnFocus
        open={props.open}
        className={styles['search__container']}
        autoComplete={props.autoComplete}
        blurOnSelect={props.blurOnSelect}
        freeSolo={props.freeSolo}
        fullWidth={props.fullWidth}
        loading={props.loading}
        loadingText={props.loadingText || 'Loading...'}
        limitTags={props.limitTags || -1}
        autoHighlight={props.autoHighlight}
        autoSelect={props.autoSelect}
        disableClearable={props.disableClearable}
        clearOnEscape={props.clearOnEscape}
        size="medium"
        id="soom-search-autocomplete"
        inputValue={props.inputValue}
        options={props.options}
        onInputChange={props.onChange}
        onClose={props.onClose}
        filterOptions={(x) => x}
        renderInput={(params) => (
          <Paper elevation={0} sx={{ p: '0', display: 'flex', alignItems: 'center', width: 'auto' }}>
            <TextField
              className={styles['search__field']}
              placeholder={props.placeholder}
              {...params}
              inputRef={props.inputRef}
              autoFocus
              variant={props.variant}
              size={props.size}
              margin="none"
              fullWidth={props.fullWidth}
              InputProps={{
                ...params.InputProps,
                type: 'search',
                startAdornment: (
                  <InputAdornment position="start">{props.searchIcon ? <SearchIcon /> : null}</InputAdornment>
                ),
                onKeyDown: (event) => {
                  if (event.key === 'Enter' && !props.disabledButton) props.onSearch(props.inputValue);
                }
              }}
            />
            <LoadingButton
              className={styles['search__button']}
              sx={{
                textTransform: 'none',
                marginLeft: '20px'
              }}
              color={props.searchButtonColor}
              variant={props.searchButtonVariant}
              size={props.searchButtonSize}
              disabled={props.disabledButton || false}
              loading={props.searchButtonLoading}
              onClick={() => props.onSearch(props.inputValue)}>
              {props.searchButtonText || 'Search'}
            </LoadingButton>
          </Paper>
        )}
      />
    </Box>
  );
}

export default SoomSearch;
