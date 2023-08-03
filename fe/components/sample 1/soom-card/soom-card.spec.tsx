import React from 'react';
import { render } from '@testing-library/react';

import SoomCard from './soom-card';

describe('SoomCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomCard />);
    expect(baseElement).toBeTruthy();
  });
});
