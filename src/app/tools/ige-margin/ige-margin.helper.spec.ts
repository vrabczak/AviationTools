import { convertIgeAltitudeToMeters, lookupIgeLimitKg, lookupIgeWindCorrectionKg } from './ige-margin.helper';

describe('IGE margin helper', () => {
  it('returns the exact table value for a grid point', () => {
    expect(lookupIgeLimitKg(1000, 0)).toBe(14350);
  });

  it('interpolates between altitude and temperature grid points', () => {
    expect(lookupIgeLimitKg(1050, 2.5)).toBeCloseTo(14332.75, 2);
  });

  it('converts feet to meters', () => {
    expect(convertIgeAltitudeToMeters(3280.84, 'ft')).toBeCloseTo(1000, 2);
  });

  it('looks up exact wind correction values', () => {
    expect(lookupIgeWindCorrectionKg(6, 'headwind')).toBe(461);
  });

  it('interpolates wind correction values', () => {
    expect(lookupIgeWindCorrectionKg(7.5, 'crosswind')).toBeCloseTo(180, 2);
  });

  it('returns zero correction for zero wind', () => {
    expect(lookupIgeWindCorrectionKg(0, 'tailwind')).toBe(0);
  });

  it('rejects altitude outside the table range', () => {
    expect(() => lookupIgeLimitKg(3300, 0)).toThrowError('Altitude must be between 0 m and 3200 m.');
  });

  it('rejects wind velocity outside the supported direction range', () => {
    expect(() => lookupIgeWindCorrectionKg(8, 'tailwind')).toThrowError(
      'Wind velocity for tailwind must be between 0 m/s and 7 m/s.',
    );
  });
});
