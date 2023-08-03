import { render } from '@testing-library/react';

import SoomGdpr from './soom-gdpr';

describe('SoomGdpr', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomGdpr />);
    expect(baseElement).toBeTruthy();
  });
});
