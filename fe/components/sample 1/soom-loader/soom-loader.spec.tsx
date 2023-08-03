import { render } from '@testing-library/react';

import SoomLoader from './soom-loader';

describe('SoomLoader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomLoader />);
    expect(baseElement).toBeTruthy();
  });
});
