import React from 'react';
import { render } from '@testing-library/react';

import SoomButton from './soom-button';

describe('SoomButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomButton />);
    expect(baseElement).toBeTruthy();
  });
});
