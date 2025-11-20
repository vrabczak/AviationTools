import { describe, it, expect } from 'vitest';
import { AltitudeCorrection } from '../AltitudeCorrection';

describe('AltitudeCorrection', () => {
  describe('Temperature Correction Calculations', () => {
    it('should calculate correction for cold temperature scenario', () => {
      const tool = new AltitudeCorrection();
      // Decision altitude 1500ft, airport at 1000ft, cold temp -15°C
      const result = (tool as any).calculateTemperatureCorrection(1500, 1000, -15);
      
      // Cold temperature should result in negative correction (aircraft lower than indicated)
      expect(result.correction).toBeLessThan(0);
      expect(result.correctedAltitude).toBeLessThan(1500);
    });

    it('should calculate correction for warm temperature scenario', () => {
      const tool = new AltitudeCorrection();
      // Decision altitude 1500ft, airport at 1000ft, warm temp 25°C
      const result = (tool as any).calculateTemperatureCorrection(1500, 1000, 25);
      
      // Warm temperature should result in positive correction (aircraft higher than indicated)
      expect(result.correction).toBeGreaterThan(0);
      expect(result.correctedAltitude).toBeGreaterThan(1500);
    });

    it('should calculate minimal correction for standard temperature', () => {
      const tool = new AltitudeCorrection();
      const result = (tool as any).calculateTemperatureCorrection(1000, 1000, 15);
      
      // At sea level with standard temperature (15°C), correction should be near zero
      expect(Math.abs(result.correction)).toBeLessThan(10);
    });

    it('should handle sea level airport correctly', () => {
      const tool = new AltitudeCorrection();
      // Decision altitude 500ft above sea level airport (0ft), cold temp -10°C
      const result = (tool as any).calculateTemperatureCorrection(500, 0, -10);
      
      expect(result.correctedAltitude).toBeDefined();
      expect(result.correction).toBeDefined();
      expect(isFinite(result.correctedAltitude)).toBe(true);
      // Cold temperature should give negative correction
      expect(result.correction).toBeLessThan(0);
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
      const result = (tool as any).calculateTemperatureCorrection(1000, 500, -30);
      
      expect(result.correction).toBeLessThan(-50);
      expect(result.correctedAltitude).toBeLessThan(1000);
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
      
      // At ISA temperature, correction should be minimal
      expect(Math.abs(result1.correction)).toBeLessThan(10);
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
