import { describe, it, expect } from 'vitest';
import { calculateWindComponents, headCrossWindTool, normalizeDegrees } from '../HeadCrossWind';

describe('HeadCrossWind', () => {
  it('normalizes degrees into 0-360 range', () => {
    expect(normalizeDegrees(370)).toBeCloseTo(10);
    expect(normalizeDegrees(-10)).toBeCloseTo(350);
  });

  it('calculates headwind and crosswind components', () => {
    const { headwind, crosswind, crosswindFrom } = calculateWindComponents(20, 210, 180);
    expect(headwind).toBeCloseTo(17.3, 1);
    expect(crosswind).toBeCloseTo(10, 0);
    expect(crosswindFrom).toBe('right');
  });

  it('returns no crosswind when aligned', () => {
    const { crosswind, crosswindFrom } = calculateWindComponents(15, 90, 90);
    expect(crosswind).toBeCloseTo(0, 5);
    expect(crosswindFrom).toBe('none');
  });

  it('exposes metadata', () => {
    expect(headCrossWindTool.id).toBe('head-cross-wind');
    expect(headCrossWindTool.name).toBeTruthy();
  });
});
