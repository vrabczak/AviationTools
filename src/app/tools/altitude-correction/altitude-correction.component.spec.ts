import { calculateTemperatureCorrection, altitudeCorrectionTool } from './altitude-correction.component';

describe('AltitudeCorrection', () => {
  it('calculates a correction value', () => {
    const result = calculateTemperatureCorrection(1700, 1500, -10);
    expect(result.correctedAltitude).toBeGreaterThan(0);
    expect(result.correction).toBeGreaterThan(0);
  });

  it('exposes metadata', () => {
    expect(altitudeCorrectionTool.id).toBe('altitude-correction');
    expect(altitudeCorrectionTool.name).toBeTruthy();
  });
});
