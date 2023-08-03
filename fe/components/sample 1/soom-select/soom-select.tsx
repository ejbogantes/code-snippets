/* eslint-disable @typescript-eslint/no-explicit-any */
import { find as _find } from 'lodash';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';

// import styles from './soom-select.module.scss';

// constants to set the menu size
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export interface OptionType {
  value: string;
  label: string;
}

interface ExtraProps {
  renderValue?: (selected: '' | any) => JSX.Element;
  multiple?: boolean;
}

/* eslint-disable-next-line */
export interface SoomSelectProps {
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId?: string;
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
  /**
   * This field it's using to indicate the field is required
   */
  required?: boolean;
  /**
   * This field it's using populate the options inside the select
   */
  options: OptionType[];
  /**
   * This field it's using to indicate if the select allow multi select
   */
  isMultiple?: boolean;
  /**
   * This field it's using to indicate the id of the select
   */
  id?: string;
  /**
   * This field it's using to indicate the name of the select
   */
  name?: string;
  /**
   * This field it's using to indicate the label of the select
   */
  label?: string;
  /**
   * This field it's using to indicate the label id of the select
   */
  labelId?: string;
  /**
   * This field it's using to indicate if the value selection has an error
   */
  error?: boolean;
  /**
   * This field it's using to indicate the error description (if has an error)
   */
  textError?: string;
  /**
   * This field it's using to indicate the value or values selected as default
   */
  value?: '' | any;
  /**
   * This field it's using to indicate the value or values that are disabled
   */
  disabledValue?: '' | any;
  /**
   * This field it's using to indicate the on change function of the select
   */
  onChange?: (event: SelectChangeEvent) => void;
  /**
   * disabled
   */
  disabled?: boolean;
  /**
   * widthAuto
   */
  widthAuto?: boolean;
}

export function SoomSelect(props: SoomSelectProps) {
  // extra props if selection is multiple
  const extraProps: ExtraProps = {};
  if (props.isMultiple) {
    extraProps.multiple = true;
    // extraProps.inputProps = { sx: { padding: '12.5px 14px' } };
    extraProps.renderValue = (selected) => (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((value: '' | any) => (
          <Chip key={value} label={value} sx={{ height: 'auto' }} />
        ))}
      </Box>
    );
  }

  // value always has to be an array (empty array if none option is selected)
  const value = props.value && typeof props.value !== 'undefined' ? props.value : props.isMultiple ? [] : '';

  // disabled value
  let disabledValue: string[] = [];
  if (props.disabledValue && typeof props.disabledValue !== 'undefined') {
    disabledValue = Array.isArray(props.disabledValue) ? props.disabledValue : [props.disabledValue];
  }

  return (
    <FormControl
      fullWidth={!props.widthAuto}
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
      error={props.error}
    >
      {props.label ? (
        <InputLabel id={props.labelId}>{props.required ? `${props.label} *` : props.label}</InputLabel>
      ) : null}
      <Select
        id={props.id}
        name={props.name}
        label={props.required ? `${props.label} *` : props.label}
        labelId={props.labelId}
        value={value}
        onChange={props.onChange}
        disabled={props.disabled || false}
        MenuProps={{
          PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP } }
        }}
        {...extraProps}
      >
        {props.options.map((opt, index) => {
          const disabled = _find(disabledValue, (v) => {
            return v === opt.value;
          });
          return (
            <MenuItem
              key={`${props.name || props.id || 'selectOpt'}${index}`}
              value={opt.value}
              disabled={Boolean(disabled)}
            >
              {opt.label}
            </MenuItem>
          );
        })}
      </Select>
      {props.error ? <FormHelperText>{props.textError}</FormHelperText> : null}
    </FormControl>
  );
}

export default SoomSelect;
