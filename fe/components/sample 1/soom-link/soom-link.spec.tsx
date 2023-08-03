import React from 'react';
import { render } from '@testing-library/react';

import SoomLink from './soom-link';

describe('SoomLink', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomLink />);
    expect(baseElement).toBeTruthy();
  });
});
