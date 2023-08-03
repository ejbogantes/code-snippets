import React from 'react';
import { render } from '@testing-library/react';

import SoomCardMedia from './soom-card-media';

describe('SoomCardMedia', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomCardMedia />);
    expect(baseElement).toBeTruthy();
  });
});
