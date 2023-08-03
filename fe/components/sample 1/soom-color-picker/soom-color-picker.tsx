import { MuiColorInput } from 'mui-color-input';
import styles from './soom-color-picker.module.scss';

/* eslint-disable-next-line */
export interface SoomColorPickerProps {
  /**
   * This field it's using to specify the name of the color picker.
   */
  name: string;
  /**
   * This field it's using for the text in the color picker.
   */
  label: string;
  /**
   * This field it's using for the value in the color picker.
   */
  value: string;
  /**
   * This field it's using for the onChange in the color picker.
   */
  onChange: (value: string) => void;
  /**
   * This field it's using to indicate if the value has an error
   */
  error?: boolean;
  /**
   * This field it's using to indicate the error description (if has an error)
   */
  errorText?: string;
  /**
   * This field it's using as a unique key to creating end-to-end testing.
   */
  dataTestId?: string;
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
}

export function SoomColorPicker(props: SoomColorPickerProps) {
  return (
    <MuiColorInput
      fullWidth
      format="hex"
      name={props.name}
      size="medium"
      variant="outlined"
      label={props.label}
      value={props.value}
      onChange={props.onChange}
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
      className={styles['color-picker__container']}
      error={props.error}
      helperText={props.error ? props.errorText : undefined}
    />
  );
}

export default SoomColorPicker;
