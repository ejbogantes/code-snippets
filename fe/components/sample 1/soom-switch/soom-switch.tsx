import { FormControl, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
// import styles from './soom-switch.module.scss';

/* eslint-disable-next-line */
export interface SoomSwitchProps {
  /**
   * This prop it's using as a unique key to creating end-to-end testing
   */
  dataTestId?: string;
  /**
   * This prop it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
  /**
   * This prop it's usin
   */
  color: 'primary' | 'secondary' | 'warning' | 'default' | 'error';
  /**
   * This prop it's indicate if the switch is active or not
   */
  isChecked: boolean;
  /**
   * This prop it's using to indicate the name of the component
   */
  name: string;
  /**
   * This prop it's using to manage onChange event in the component
   */
  handleOnChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * This prop it's using to indicate the label to show in the app
   */
  label: string;
  /**
   * This prop it's using to indicate the classes that the component will use
   */
  className?: string;
  /**
   * This prop it's using to indicate if the component its active or not
   */
  disabled?: boolean;
}

export function SoomSwitch(props: SoomSwitchProps) {
  return (
    <FormControl fullWidth data-test-id={props.dataTestId} aria-label={props.ariaLabel}>
      <FormControlLabel
        sx={{ minHeight: '56px' }}
        value="top"
        control={
          <Switch
            color={props.color}
            checked={props.isChecked}
            name={props.name}
            onChange={props.handleOnChange}
            className={props.className}
            disabled={props.disabled}
          />
        }
        label={props.label}
        labelPlacement="end"
      />
    </FormControl>
  );
}

export default SoomSwitch;
