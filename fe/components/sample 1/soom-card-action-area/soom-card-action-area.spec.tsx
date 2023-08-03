import React from 'react';
import { render } from '@testing-library/react';

import SoomCardActionArea from './soom-card-action-area';

describe('SoomCardActionArea', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomCardActionArea />);
    expect(baseElement).toBeTruthy();
  });
});
