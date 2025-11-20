import { describe, it, expect } from 'vitest';
import { TurnCalculator } from '../TurnCalculator';

describe('TurnCalculator', () => {
  describe('Turn Performance Calculations', () => {
    it('should calculate turn rate for typical parameters', () => {
      const tool = new TurnCalculator();
      
      // 120kt at 15° bank produces approximately 2.4°/sec
      const result = (tool as any).calculateTurn(120, 15);
      const turnRate = 360 / result.time360Seconds;
      
      expect(turnRate).toBeGreaterThan(2.0);
      expect(turnRate).toBeLessThan(2.6);
    });

    it('should calculate turn radius correctly for 120kt at 30° bank', () => {
      const tool = new TurnCalculator();
      const result = (tool as any).calculateTurn(120, 30);
      
      expect(result.radiusMeters).toBeGreaterThan(0);
      expect(result.time360Seconds).toBeGreaterThan(0);
      expect(isFinite(result.radiusMeters)).toBe(true);
    });

    it('should show smaller radius for steeper bank angle', () => {
      const tool = new TurnCalculator();
      const speed = 150;
      
      const result15 = (tool as any).calculateTurn(speed, 15);
      const result45 = (tool as any).calculateTurn(speed, 45);
      
      expect(result45.radiusMeters).toBeLessThan(result15.radiusMeters);
    });

    it('should show faster turn for steeper bank angle', () => {
      const tool = new TurnCalculator();
      const speed = 150;
      
      const result15 = (tool as any).calculateTurn(speed, 15);
      const result45 = (tool as any).calculateTurn(speed, 45);
      
      expect(result45.time360Seconds).toBeLessThan(result15.time360Seconds);
    });

    it('should show larger radius for higher speed', () => {
      const tool = new TurnCalculator();
      const bank = 30;
      
      const result100 = (tool as any).calculateTurn(100, bank);
      const result200 = (tool as any).calculateTurn(200, bank);
      
      expect(result200.radiusMeters).toBeGreaterThan(result100.radiusMeters);
    });

    it('should handle very shallow bank angle', () => {
      const tool = new TurnCalculator();
      const result = (tool as any).calculateTurn(120, 5);
      
      expect(result.radiusMeters).toBeGreaterThan(1000);
      expect(result.time360Seconds).toBeGreaterThan(200);
    });

    it('should handle steep bank angle (60°)', () => {
      const tool = new TurnCalculator();
      const result = (tool as any).calculateTurn(150, 60);
      
      expect(result.radiusMeters).toBeGreaterThan(0);
      expect(result.time360Seconds).toBeGreaterThan(0);
      expect(isFinite(result.radiusMeters)).toBe(true);
    });

    it('should handle slow speed (60kt)', () => {
      const tool = new TurnCalculator();
      const result = (tool as any).calculateTurn(60, 15);
      
      expect(result.radiusMeters).toBeGreaterThan(0);
      expect(result.time360Seconds).toBeGreaterThan(0);
    });

    it('should handle high speed (300kt)', () => {
      const tool = new TurnCalculator();
      const result = (tool as any).calculateTurn(300, 30);
      
      expect(result.radiusMeters).toBeGreaterThan(0);
      expect(result.time360Seconds).toBeGreaterThan(0);
    });

    it('should verify physics relationship: radius proportional to speed squared', () => {
      const tool = new TurnCalculator();
      const bank = 25;
      
      const result100 = (tool as any).calculateTurn(100, bank);
      const result200 = (tool as any).calculateTurn(200, bank);
      
      // Radius should roughly quadruple when speed doubles
      const ratio = result200.radiusMeters / result100.radiusMeters;
      expect(ratio).toBeGreaterThan(3.5);
      expect(ratio).toBeLessThan(4.5);
    });

    it('should return infinity for edge case: 90° bank', () => {
      const tool = new TurnCalculator();
      const result = (tool as any).calculateTurn(120, 90);
      
      expect(result.radiusMeters).toBe(Infinity);
      expect(result.time360Seconds).toBe(Infinity);
    });

    it('should return infinity for edge case: 0° bank', () => {
      const tool = new TurnCalculator();
      const result = (tool as any).calculateTurn(120, 0);
      
      expect(result.radiusMeters).toBe(Infinity);
      expect(result.time360Seconds).toBe(Infinity);
    });
  });

  describe('Tool Integration', () => {
    it('should have correct metadata', () => {
      const tool = new TurnCalculator();
      
      expect(tool.id).toBe('turn-calculator');
      expect(tool.name).toBe('Turn Calculator');
      expect(tool.description).toBeTruthy();
    });

    it('should create and destroy without errors', () => {
      const tool = new TurnCalculator();
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