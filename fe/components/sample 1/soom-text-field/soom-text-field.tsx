/* eslint-disable dot-notation */
import React from 'react';
import TextField from '@mui/material/TextField';
import styles from './soom-text-field.module.scss';

/* eslint-disable-next-line */
export interface SoomTextFieldProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel: string;
  /**
   *
   */
  autoComplete?: string;
  /**
   * This field it's using to adding a custom class in the component
   */
  className?: string;

  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  handlerOnChange?: (event: object) => void;
  handlerOnBlur?: (event: object) => void;
  handlerOnClick?: () => void;
  helperText?: string;
  /**
   * This it's the unique key for the TextFields, this prop is mandatory
   */
  id: string;
  /**
   * This field it's using to indicate the text to show in the input
   */
  label?: string;
  maxRows?: string | number;
  /**
   * This field it's using to indicate if the input allow multiline
   */
  multiline?: boolean;
  /**
   * This field it's using to indicate the name of the input
   */
  name: string;
  /**
   * This field it's using to indicate the text inside the input
   */
  placeholder?: string;
  /**
   * This field it's using to indicate if the input will be required or not
   */
  required?: boolean;
  rows?: string | number;
  /**
   * This field it's using to indicate the size of the input
   */
  size?: 'small' | 'medium';
  /**
   * This field it's using to indicate which type of input will be
   */
  type?: 'text' | 'password' | 'number' | 'search' | 'email';
  value?: unknown;
  variant: 'standard' | 'filled' | 'outlined';
  endAdornment?: React.ReactNode;
}

export function SoomTextField(props: SoomTextFieldProps) {
  return (
    <TextField
      variant={props.variant}
      type={props.type}
      color={props.color}
      size={props.size}
      label={props.label}
      defaultValue={props.defaultValue}
      helperText={props.helperText}
      placeholder={props.placeholder}
      error={props.error}
      required={props.required}
      disabled={props.disabled}
      autoComplete={props.autoComplete}
      multiline={props.multiline}
      rows={props.rows}
      maxRows={props.maxRows}
      value={props.value}
      className={`${styles['text_field__container']} ${props.className || ''}`}
      onClick={props.handlerOnClick}
      fullWidth={props.fullWidth}
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
      name={props.name}
      onChange={props.handlerOnChange}
      onBlur={props.handlerOnBlur}
      InputProps={{
        endAdornment: props.endAdornment
      }}
    />
  );
}

export default SoomTextField;
