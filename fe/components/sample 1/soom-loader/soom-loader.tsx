/* eslint-disable @next/next/no-img-element */
/* eslint-disable dot-notation */

import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// import styles from './soom-loader.module.scss';

export interface SoomLinearLoaderProps {
  /**
   * This prop it's using for choose between circular o linear loader
   */
  type: 'circular' | 'linear';
  /**
   * This prop it's using for choose the color of the loader
   */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
  /**
   * This prop it's using for choose the variant of the loader (circular loader only accept "determinate" and "indeterminate")
   */
  variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query';
  /**
   * This prop it's using for display the progress percentage
   */
  value?: number;
  /**
   * This prop it's using for choose the color of the progress percentage label
   */
  textColor?:
    | 'primary.main'
    | 'secondary.main'
    | 'error.main'
    | 'warning.main'
    | 'info.main'
    | 'success.main'
    | 'text.primary'
    | 'text.secondary'
    | 'text.disabled';
  /**
   * This prop it's using for add the field to the component
   */
  dataTestId?: string;
  /**
   * This prop it's using for add the field to the component
   */
  ariaLabel?: string;
}

export interface SoomCircularLoaderProps {
  /**
   * This prop it's using for choose between circular o linear loader
   */
  type: 'circular' | 'linear';
  /**
   * This prop it's using for choose the color of the loader
   */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
  /**
   * This prop it's using for choose the variant of the loader (circular loader only accept "determinate" and "indeterminate")
   */
  variant?: 'determinate' | 'indeterminate';
  /**
   * This prop it's using for display the progress percentage
   */
  value?: number;
  /**
   * This prop it's using for choose the color of the progress percentage label
   */
  textColor?:
    | 'primary.main'
    | 'secondary.main'
    | 'error.main'
    | 'warning.main'
    | 'info.main'
    | 'success.main'
    | 'text.primary'
    | 'text.secondary'
    | 'text.disabled';
  /**
   * This prop it's using for add the field to the component
   */
  dataTestId?: string;
  /**
   * This prop it's using for add the field to the component
   */
  ariaLabel?: string;
}

const Circular = (props: SoomCircularLoaderProps) => {
  if (props.value && typeof props.value !== 'undefined' && !isNaN(props.value)) {
    return (
      <Box
        data-test-id={props.dataTestId}
        aria-label={props.ariaLabel}
        sx={{ position: 'relative', display: 'inline-flex' }}
      >
        <CircularProgress color={props.color} variant={props.variant} value={props.value} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color={props.textColor || 'text.secondary'}>
            {`${props.value ? Math.round(props.value) : 0}%`}
          </Typography>
        </Box>
      </Box>
    );
  } else {
    return (
      <CircularProgress
        color={props.color}
        variant={props.variant}
        data-test-id={props.dataTestId}
        aria-label={props.ariaLabel}
      />
    );
  }
};

type SoomLoaderProps = SoomLinearLoaderProps | SoomCircularLoaderProps;

const Linear = (props: SoomLinearLoaderProps) => {
  if (props.value && typeof props.value !== 'undefined' && !isNaN(props.value)) {
    return (
      <Box
        data-test-id={props.dataTestId}
        aria-label={props.ariaLabel}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress color={props.color} variant={props.variant} value={props.value} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color={props.textColor || 'text.secondary'}>
            {`${props.value ? Math.round(props.value) : 0}%`}
          </Typography>
        </Box>
      </Box>
    );
  } else {
    return (
      <LinearProgress
        color={props.color}
        variant={props.variant}
        data-test-id={props.dataTestId}
        aria-label={props.ariaLabel}
      />
    );
  }
};

export function SoomLoader(props: SoomLoaderProps) {
  if (props.type === 'circular') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <Circular {...props} />;
  } else if (props.type === 'linear') {
    return <Linear {...props} />;
  }
  return null;
}

export default SoomLoader;
