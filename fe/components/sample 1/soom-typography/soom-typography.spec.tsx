import React from 'react';
import { render } from '@testing-library/react';

import SoomTypography from './soom-typography';

describe('SoomTypography', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomTypography />);
    expect(baseElement).toBeTruthy();
  });
});
