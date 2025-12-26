import { SpeedConversionComponent, speedConversionTool } from './speed-conversion.component';

describe('SpeedConversion', () => {
  it('converts knots to m/s', () => {
    const component = new SpeedConversionComponent();
    const ms = component.convertSpeed(100, 'kt', 'ms');
    expect(ms).toBeCloseTo(51.4444, 3);
  });

  it('converts m/s to km/h', () => {
    const component = new SpeedConversionComponent();
    const kmh = component.convertSpeed(10, 'ms', 'kmh');
    expect(kmh).toBeCloseTo(36, 2);
  });

  it('exposes metadata', () => {
    expect(speedConversionTool.id).toBe('speed-conversion');
    expect(speedConversionTool.name).toBeTruthy();
  });
});
