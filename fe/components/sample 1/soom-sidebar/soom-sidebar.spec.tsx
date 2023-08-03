import React from 'react';
import { render } from '@testing-library/react';

import SoomSidebar from './soom-sidebar';

describe('SoomSidebar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomSidebar />);
    expect(baseElement).toBeTruthy();
  });
});
