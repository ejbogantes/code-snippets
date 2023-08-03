import React from 'react';
import { render } from '@testing-library/react';
import SoomCardContent from './soom-card-content';

describe('SoomCardContent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomCardContent />);
    expect(baseElement).toBeTruthy();
  });
});
