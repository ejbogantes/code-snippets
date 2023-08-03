import React from 'react';
import { render } from '@testing-library/react';

import SoomDialog from './soom-dialog';

describe('SoomDialog', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomDialog />);
    expect(baseElement).toBeTruthy();
  });
});
