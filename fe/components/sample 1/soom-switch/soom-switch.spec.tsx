import { render } from '@testing-library/react';

import SoomSwitch from './soom-switch';

describe('SoomSwitch', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomSwitch />);
    expect(baseElement).toBeTruthy();
  });
});
