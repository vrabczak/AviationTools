import { describe, it, expect } from 'vitest';
import { convertDistance, distanceConversionTool } from '../DistanceConversion';

describe('DistanceConversion', () => {
  it('converts meters to other units', () => {
    expect(convertDistance(1000, 'm', 'km')).toBeCloseTo(1);
    expect(convertDistance(1852, 'm', 'nm')).toBeCloseTo(1);
    expect(convertDistance(304.8, 'm', 'ft')).toBeCloseTo(1000, 0);
  });

  it('converts nautical miles to meters', () => {
    expect(convertDistance(2, 'nm', 'm')).toBeCloseTo(3704, 0);
  });

  it('exposes metadata', () => {
    expect(distanceConversionTool.id).toBe('distance-conversion');
    expect(distanceConversionTool.name).toBeTruthy();
  });
});
