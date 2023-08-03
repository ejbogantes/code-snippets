import React from 'react';
import { render } from '@testing-library/react';

import SoomBreadcrumbs from './soom-breadcrumbs';

describe('SoomBreadcrumbs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomBreadcrumbs />);
    expect(baseElement).toBeTruthy();
  });
});
