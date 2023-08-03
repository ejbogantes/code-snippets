import React from 'react';
import { render } from '@testing-library/react';

import SoomNavbar from './soom-navbar';

describe('SoomNavbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomNavbar />);
    expect(baseElement).toBeTruthy();
  });
});
