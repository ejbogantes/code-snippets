import { render } from '@testing-library/react';

import SoomWorldMap from './soom-world-map';

describe('SoomWorldMap', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SoomWorldMap />);
    expect(baseElement).toBeTruthy();
  });
});
