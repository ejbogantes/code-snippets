import React from 'react';
import { render } from '@testing-library/react';

import SoomCardActions from './soom-card-actions';

describe('SoomCardActions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomCardActions />);
    expect(baseElement).toBeTruthy();
  });
});
