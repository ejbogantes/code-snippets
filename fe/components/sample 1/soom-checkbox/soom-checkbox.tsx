import React from 'react';
// import styles from './soom-checkbox.module.scss';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';

export interface SoomCheckboxProps {
  /**
   * This field it's to indicate that the initial value of the checkbox it's checked
   */
  defaultChecked: boolean;
  /**
   * This field it's using to indicate the text in the checkbox
   */
  label: string;
  /**
   * This field it's using to indicate the place where the text should be show
   */
  labelPlacement: 'top' | 'start' | 'bottom' | 'end';
  /**
   * This field it's using to indicate the size of the checkbox
   */
  size: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
  /**
   * This field it's using to indicate the on change function of the checkbox
   */
  handlerOnChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  /**
   * This field it's using to indicate the on change function of the checkbox
   */
  handlerOnBlur?: (event: object) => void;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId?: string;
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
}

export function SoomCheckbox(props: SoomCheckboxProps) {
  return (
    <FormControl data-test-id={props.dataTestId} aria-label={props.ariaLabel} error={props.error}>
      <FormControlLabel
        control={<Checkbox size={props.size} onChange={props.handlerOnChange} onBlur={props.handlerOnBlur} />}
        labelPlacement={props.labelPlacement}
        label={props.label}
      />
      {props.error ? <FormHelperText>{props.helperText}</FormHelperText> : null}
    </FormControl>
  );
}

export default SoomCheckbox;
