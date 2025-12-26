import { FuelConversionComponent, fuelConversionTool } from './fuel-conversion.component';

describe('FuelConversion', () => {
  it('converts pounds to liters using density', () => {
    const component = new FuelConversionComponent();
    const liters = component.convertToLiters(100, 'pound', 0.8);
    expect(liters).toBeGreaterThan(0);
  });

  it('returns all units', () => {
    const component = new FuelConversionComponent();
    const result = component.convertFuel(100, 'liters', 0.8);
    expect(result.kg).toBeCloseTo(80, 2);
    expect(result.gallon).toBeGreaterThan(0);
  });

  it('exposes metadata', () => {
    expect(fuelConversionTool.id).toBe('fuel-conversion');
    expect(fuelConversionTool.name).toBeTruthy();
  });
});
