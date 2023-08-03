import React from 'react';
import { render } from '@testing-library/react';

import SoomAlert from './soom-alert';

describe('SoomAlert', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomAlert />);
    expect(baseElement).toBeTruthy();
  });
});
