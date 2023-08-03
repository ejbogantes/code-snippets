import React from 'react';
import { render } from '@testing-library/react';

import SoomTextField from './soom-text-field';

describe('SoomTextField', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomTextField />);
    expect(baseElement).toBeTruthy();
  });
});
