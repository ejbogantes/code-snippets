import React from 'react';
import { render } from '@testing-library/react';

import SoomCheckbox from './soom-checkbox';

describe('SoomCheckbox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomCheckbox />);
    expect(baseElement).toBeTruthy();
  });
});
