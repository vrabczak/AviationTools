import { convertAltitudeToMeters, lookupOgeLimitKg } from './oge-margin.helper';

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

  it('rejects altitude outside the table range', () => {
    expect(() => lookupOgeLimitKg(3300, 0)).toThrowError('Altitude must be between 0 m and 3200 m.');
  });
});
