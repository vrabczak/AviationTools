import { describe, it, expect } from 'vitest';
import { altitudeCorrectionTool, calculateTemperatureCorrection } from '../AltitudeCorrection';

describe('AltitudeCorrection', () => {
  describe('Temperature Correction Calculations', () => {
    it('calculates correction for cold temperature scenario', () => {
      const result = calculateTemperatureCorrection(1500, 1000, -15);
      expect(result.correction).toBeGreaterThan(0);
      expect(result.correction).toBeCloseTo(54.3, 0);
      expect(result.correctedAltitude).toBeGreaterThan(1500);
    });

    it('calculates correction for warm temperature scenario', () => {
      const result = calculateTemperatureCorrection(1500, 1000, 25);
      expect(result.correction).toBeLessThan(0);
      expect(result.correction).toBeCloseTo(-20.1, 0);
      expect(result.correctedAltitude).toBeLessThan(1500);
    });

    it('returns zero correction at ISA temperature', () => {
      const result = calculateTemperatureCorrection(500, 0, 15);
      expect(result.correction).toBeCloseTo(0, 5);
    });

    it('handles high altitude airport', () => {
      const result = calculateTemperatureCorrection(8000, 5000, -20);
      expect(result.correctedAltitude).toBeDefined();
      expect(isFinite(result.correctedAltitude)).toBe(true);
    });

    it('maintains ISA deviation relationship', () => {
      const airportAlt = 2000;
      const decisionAlt = 3000;
      const result = calculateTemperatureCorrection(decisionAlt, airportAlt, 11);
      expect(result.correction).toBeCloseTo(0, 5);
    });
  });

  describe('Tool Metadata', () => {
    it('exposes correct metadata', () => {
      expect(altitudeCorrectionTool.id).toBe('altitude-correction');
      expect(altitudeCorrectionTool.name).toBe('Altitude Correction');
      expect(altitudeCorrectionTool.description).toBeTruthy();
    });
  });
});
