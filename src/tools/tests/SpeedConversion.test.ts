import { describe, it, expect } from 'vitest';
import { convertSpeed, speedConversionTool } from '../SpeedConversion';

describe('SpeedConversion', () => {
  it('converts knots to km/h', () => {
    expect(convertSpeed(100, 'kt', 'kmh')).toBeCloseTo(185.2, 1);
  });

  it('converts km/h to m/s', () => {
    expect(convertSpeed(36, 'kmh', 'ms')).toBeCloseTo(10, 5);
  });

  it('converts feet per minute to knots', () => {
    expect(convertSpeed(600, 'ftmin', 'kt')).toBeCloseTo(5.9, 1);
  });

  it('exposes metadata', () => {
    expect(speedConversionTool.id).toBe('speed-conversion');
    expect(speedConversionTool.name).toBeTruthy();
  });
});
