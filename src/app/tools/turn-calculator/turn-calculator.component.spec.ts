import { TurnCalculatorComponent, turnCalculatorTool } from './turn-calculator.component';

describe('TurnCalculator', () => {
  it('calculates a turn radius', () => {
    const component = new TurnCalculatorComponent();
    const result = component.calculateTurn(120, 15);
    expect(result.radiusMeters).toBeGreaterThan(0);
    expect(result.time360Seconds).toBeGreaterThan(0);
  });

  it('exposes metadata', () => {
    expect(turnCalculatorTool.id).toBe('turn-calculator');
    expect(turnCalculatorTool.name).toBeTruthy();
  });
});
