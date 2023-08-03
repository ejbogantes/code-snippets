import { render } from '@testing-library/react';

import SoomSelect from './soom-select';

describe('SoomSelect', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomSelect />);
    expect(baseElement).toBeTruthy();
  });
});
