import { convertIgeAltitudeToMeters, lookupIgeLimitKg } from './ige-margin.helper';

describe('IGE margin helper', () => {
  it('returns the exact table value for a grid point', () => {
    expect(lookupIgeLimitKg(1000, 0)).toBe(14350);
  });

  it('interpolates between altitude and temperature grid points', () => {
    expect(lookupIgeLimitKg(1050, 2.5)).toBeCloseTo(14336.5, 2);
  });

  it('converts feet to meters', () => {
    expect(convertIgeAltitudeToMeters(3280.84, 'ft')).toBeCloseTo(1000, 2);
  });

  it('rejects altitude outside the table range', () => {
    expect(() => lookupIgeLimitKg(3300, 0)).toThrowError('Altitude must be between 0 m and 3200 m.');
  });
});
