import React from 'react';
import { render } from '@testing-library/react';

import SoomFloatingButton from './soom-floating-button';

describe('SoomFloatingButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomFloatingButton />);
    expect(baseElement).toBeTruthy();
  });
});
