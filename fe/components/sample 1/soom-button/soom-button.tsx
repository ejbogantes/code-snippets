/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { LoadingButton } from '@mui/lab';
import styles from './soom-button.module.scss';

export interface SoomButtonProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel: string;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId: string;
  /**
   * This prop it's using to specify the function that will be execute when you click the button
   */
  handlerOnClick?: (e: any) => void;
  /**
   * This prop it's using to add the label to the button
   */
  label: React.ReactNode;
  /**
   * This field indicate the type of the button
   */
  type?: 'submit' | 'button' | 'reset';
  /**
   * This prop it's using to choose the style in the button
   */
  variant: 'outlined' | 'contained' | 'text';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | undefined;
  /**
   * to show a loading button
   */
  loading?: boolean;
  /**
   * to disabled the button
   */
  disabled?: boolean;

  /**
   * autoFocus
   */
  autoFocus?: boolean;

  className?: string;

  sx?: object;

  size?: 'small' | 'medium' | 'large';

  fullWidth?: boolean;
}

export function SoomButton(props: SoomButtonProps) {
  return (
    <LoadingButton
      color={props.color}
      variant={props.variant}
      className={`${styles['button__container']} ${props.className || ''}`}
      onClick={props.handlerOnClick}
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
      type={props.type}
      loading={props.loading}
      disabled={props.disabled}
      autoFocus={props.autoFocus}
      sx={props.sx}
      size={props.size || 'medium'}
      fullWidth={props.fullWidth || false}
    >
      {props.label}
    </LoadingButton>
  );
}

export default SoomButton;
