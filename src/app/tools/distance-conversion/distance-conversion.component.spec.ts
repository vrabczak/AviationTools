import { DistanceConversionComponent, distanceConversionTool } from './distance-conversion.component';

describe('DistanceConversion', () => {
  it('converts meters to nautical miles', () => {
    const component = new DistanceConversionComponent();
    const nm = component.convertDistance(1852, 'm', 'nm');
    expect(nm).toBeCloseTo(1, 4);
  });

  it('converts nautical miles to kilometers', () => {
    const component = new DistanceConversionComponent();
    const km = component.convertDistance(1, 'nm', 'km');
    expect(km).toBeCloseTo(1.852, 3);
  });

  it('exposes metadata', () => {
    expect(distanceConversionTool.id).toBe('distance-conversion');
    expect(distanceConversionTool.name).toBeTruthy();
  });
});
