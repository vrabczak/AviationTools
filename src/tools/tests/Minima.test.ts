import { describe, it, expect } from 'vitest';
import { calculateMinima, minimaAltitudeHeightTool } from '../MinimaAltitudeHeight';

describe('MinimaAltitudeHeight', () => {
  it('uses aircraft minima when OCH is lower', () => {
    const result = calculateMinima(1500, 200, 300, 50);
    expect(result.decisionHeight).toBeCloseTo(350);
    expect(result.decisionAltitude).toBeCloseTo(1650);
    expect(result.usesAircraftMinima).toBe(true);
  });

  it('uses OCH when it is higher than aircraft minima', () => {
    const result = calculateMinima(1500, 300, 200, 50);
    expect(result.decisionHeight).toBeCloseTo(350);
    expect(result.usesAircraftMinima).toBe(false);
  });

  it('exposes metadata', () => {
    expect(minimaAltitudeHeightTool.id).toBe('minima');
    expect(minimaAltitudeHeightTool.name).toBeTruthy();
  });
});
