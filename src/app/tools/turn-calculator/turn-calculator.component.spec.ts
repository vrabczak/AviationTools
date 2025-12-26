import { calculateTurn, turnCalculatorTool } from './turn-calculator.component';

describe('TurnCalculator', () => {
  it('calculates a turn radius', () => {
    const result = calculateTurn(120, 15);
    expect(result.radiusMeters).toBeGreaterThan(0);
    expect(result.time360Seconds).toBeGreaterThan(0);
  });

  it('exposes metadata', () => {
    expect(turnCalculatorTool.id).toBe('turn-calculator');
    expect(turnCalculatorTool.name).toBeTruthy();
  });
});
