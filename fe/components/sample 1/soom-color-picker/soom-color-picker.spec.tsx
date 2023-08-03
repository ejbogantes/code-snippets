import { render } from '@testing-library/react';

import SoomColorPicker from './soom-color-picker';

describe('SoomColorPicker', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomColorPicker />);
    expect(baseElement).toBeTruthy();
  });
});
