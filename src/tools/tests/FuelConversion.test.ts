import { describe, it, expect } from 'vitest';
import { convertFuel, convertToLiters, fuelConversionTool } from '../FuelConversion';

describe('FuelConversion', () => {
  it('converts between liters and kilograms with density', () => {
    const liters = convertToLiters(100, 'kg', 0.8);
    expect(liters).toBeCloseTo(125);
  });

  it('converts all units', () => {
    const result = convertFuel(100, 'liters', 0.8);
    expect(result.kg).toBeCloseTo(80);
    expect(result.gallon).toBeCloseTo(26.42, 2);
    expect(result.pound).toBeCloseTo(176.37, 2);
  });

  it('exposes metadata', () => {
    expect(fuelConversionTool.id).toBe('fuel-conversion');
    expect(fuelConversionTool.name).toBeTruthy();
  });
});
