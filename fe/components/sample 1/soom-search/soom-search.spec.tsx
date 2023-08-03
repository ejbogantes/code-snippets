import React from 'react';
import { render } from '@testing-library/react';

import SoomSearch from './soom-search';

describe('SoomSearch', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomSearch />);
    expect(baseElement).toBeTruthy();
  });
});
