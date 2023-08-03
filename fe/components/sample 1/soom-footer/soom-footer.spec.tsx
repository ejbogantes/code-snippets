import React from 'react';
import { render } from '@testing-library/react';

import SoomFooter from './soom-footer';

describe('SoomFooter', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomFooter />);
    expect(baseElement).toBeTruthy();
  });
});
