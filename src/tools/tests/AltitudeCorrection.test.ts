import { describe, it, expect } from 'vitest';
import { AltitudeCorrection } from '../AltitudeCorrection';

describe('AltitudeCorrection', () => {
  describe('Temperature Correction Calculations', () => {
    it('should calculate correction for cold temperature scenario', () => {
      const tool = new AltitudeCorrection();
      // Decision altitude 1500ft, airport at 1000ft, cold temp -15°C
      // ISA at 1000ft = 15 - 2 = 13°C
      // Correction = 500 × (13 - (-15)) / (273 + (-15)) = 500 × 28 / 258 ≈ 54ft
      const result = (tool as any).calculateTemperatureCorrection(1500, 1000, -15);
      
      // Cold temperature should result in positive correction (need to fly higher)
      expect(result.correction).toBeGreaterThan(0);
      expect(result.correction).toBeCloseTo(54.3, 0);
      expect(result.correctedAltitude).toBeGreaterThan(1500);
    });

    it('should calculate correction for warm temperature scenario', () => {
      const tool = new AltitudeCorrection();
      // Decision altitude 1500ft, airport at 1000ft, warm temp 25°C
      // ISA at 1000ft = 13°C, so 25°C is 12°C above ISA
      // Correction = 500 × (13 - 25) / (273 + 25) = 500 × (-12) / 298 ≈ -20ft
      const result = (tool as any).calculateTemperatureCorrection(1500, 1000, 25);
      
      // Warm temperature should result in negative correction (aircraft higher than indicated)
      expect(result.correction).toBeLessThan(0);
      expect(result.correction).toBeCloseTo(-20.1, 0);
      expect(result.correctedAltitude).toBeLessThan(1500);
    });

    it('should calculate zero correction at ISA temperature', () => {
      const tool = new AltitudeCorrection();
      // At sea level (0ft), ISA = 15°C
      // Height = 500ft, Correction = 500 × (15 - 15) / 288 = 0
      const result = (tool as any).calculateTemperatureCorrection(500, 0, 15);
      
      // At ISA temperature, correction should be zero
      expect(result.correction).toBeCloseTo(0, 5);
    });

    it('should handle sea level airport correctly', () => {
      const tool = new AltitudeCorrection();
      // Decision altitude 500ft above sea level airport (0ft), cold temp -10°C
      // ISA at 0ft = 15°C
      // Correction = 500 × (15 - (-10)) / (273 + (-10)) = 500 × 25 / 263 ≈ 47.5ft
      const result = (tool as any).calculateTemperatureCorrection(500, 0, -10);
      
      expect(result.correctedAltitude).toBeDefined();
      expect(result.correction).toBeDefined();
      expect(isFinite(result.correctedAltitude)).toBe(true);
      // Cold temperature should give positive correction
      expect(result.correction).toBeGreaterThan(0);
      expect(result.correction).toBeCloseTo(47.5, 0);
    });

    it('should calculate larger correction for greater height above airport', () => {
      const tool = new AltitudeCorrection();
      const temp = -15;
      const airportAlt = 1000;
      
      const result1 = (tool as any).calculateTemperatureCorrection(1500, airportAlt, temp);
      const result2 = (tool as any).calculateTemperatureCorrection(3000, airportAlt, temp);
      
      // Greater height should result in larger absolute correction
      expect(Math.abs(result2.correction)).toBeGreaterThan(Math.abs(result1.correction));
    });

    it('should handle very cold temperature (-30°C)', () => {
      const tool = new AltitudeCorrection();
      // DA 1000ft, airport 500ft, temp -30°C
      // ISA at 500ft = 15 - 1 = 14°C
      // Correction = 500 × (14 - (-30)) / (273 + (-30)) = 500 × 44 / 243 ≈ 90.5ft
      const result = (tool as any).calculateTemperatureCorrection(1000, 500, -30);
      
      expect(result.correction).toBeGreaterThan(50);
      expect(result.correction).toBeCloseTo(90.5, 0);
      expect(result.correctedAltitude).toBeGreaterThan(1000);
    });

    it('should handle high altitude airport', () => {
      const tool = new AltitudeCorrection();
      const result = (tool as any).calculateTemperatureCorrection(8000, 5000, -20);
      
      expect(result.correctedAltitude).toBeDefined();
      expect(isFinite(result.correctedAltitude)).toBe(true);
    });

    it('should maintain ISA deviation relationship', () => {
      const tool = new AltitudeCorrection();
      const airportAlt = 2000;
      const decisionAlt = 3000;
      
      // ISA at 2000ft = 15 - (2000/1000 * 2) = 11°C
      const result1 = (tool as any).calculateTemperatureCorrection(decisionAlt, airportAlt, 11);
      
      // At ISA temperature, correction should be zero
      expect(result1.correction).toBeCloseTo(0, 5);
    });
  });

  describe('Tool Integration', () => {
    it('should have correct metadata', () => {
      const tool = new AltitudeCorrection();
      
      expect(tool.id).toBe('altitude-correction');
      expect(tool.name).toBe('Altitude Correction');
      expect(tool.description).toBeTruthy();
    });

    it('should create and destroy without errors', () => {
      const tool = new AltitudeCorrection();
      const mockContainer = document.createElement('div');
      
      expect(() => {
        tool.render(mockContainer);
      }).not.toThrow();
      
      expect(() => {
        tool.destroy();
      }).not.toThrow();
    });
  });
});
