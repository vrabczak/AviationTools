import { convertAltitudeToMeters, lookupOgeLimitKg, lookupOgeWindCorrectionKg } from './oge-margin.helper';

describe('OGE margin helper', () => {
  it('returns the exact table value for a grid point', () => {
    expect(lookupOgeLimitKg(1000, 0)).toBe(13211);
  });

  it('interpolates between altitude and temperature grid points', () => {
    expect(lookupOgeLimitKg(1050, 2.5)).toBeCloseTo(13193.25, 2);
  });

  it('converts feet to meters', () => {
    expect(convertAltitudeToMeters(3280.84, 'ft')).toBeCloseTo(1000, 2);
  });

  it('looks up exact wind correction values', () => {
    expect(lookupOgeWindCorrectionKg(6, 'headwind')).toBe(574);
  });

  it('interpolates wind correction values', () => {
    expect(lookupOgeWindCorrectionKg(7.5, 'crosswind')).toBeCloseTo(542.5, 2);
  });

  it('returns zero correction for zero wind', () => {
    expect(lookupOgeWindCorrectionKg(0, 'tailwind')).toBe(0);
  });

  it('rejects altitude outside the table range', () => {
    expect(() => lookupOgeLimitKg(3300, 0)).toThrowError('Altitude must be between 0 m and 3200 m.');
  });

  it('rejects wind velocity outside the supported direction range', () => {
    expect(() => lookupOgeWindCorrectionKg(8, 'tailwind')).toThrowError(
      'Wind velocity for tailwind must be between 0 m/s and 7 m/s.',
    );
  });
});
