import { describe, it, expect } from 'vitest';
import { calculateTurn, turnCalculatorTool } from '../TurnCalculator';

describe('TurnCalculator', () => {
  it('calculates turn radius and time', () => {
    const result = calculateTurn(120, 15);
    expect(result.radiusMeters).toBeGreaterThan(0);
    expect(result.time360Seconds).toBeGreaterThan(0);
  });

  it('returns infinity for invalid bank angle', () => {
    const result = calculateTurn(120, 90);
    expect(result.radiusMeters).toBe(Infinity);
  });

  it('exposes metadata', () => {
    expect(turnCalculatorTool.id).toBe('turn-calculator');
    expect(turnCalculatorTool.name).toBeTruthy();
  });
});
