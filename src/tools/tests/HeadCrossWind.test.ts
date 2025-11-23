import { describe, it, expect } from 'vitest';
import { HeadCrossWind } from '../HeadCrossWind';

describe('HeadCrossWind', () => {
  describe('Component calculations', () => {
    it('calculates full headwind when aligned with the wind', () => {
      const tool = new HeadCrossWind();
      const result = (tool as any).calculateComponents(15, 180, 180);

      expect(result.headwind).toBeCloseTo(15, 3);
      expect(Math.abs(result.crosswind)).toBeLessThan(0.01);
      expect(result.crosswindFrom).toBe('none');
    });

    it('calculates right crosswind when wind is from the right', () => {
      const tool = new HeadCrossWind();
      const result = (tool as any).calculateComponents(20, 90, 0);

      expect(Math.abs(result.headwind)).toBeLessThan(0.01);
      expect(result.crosswind).toBeCloseTo(20, 3);
      expect(result.crosswindFrom).toBe('right');
    });

    it('calculates tailwind correctly', () => {
      const tool = new HeadCrossWind();
      const result = (tool as any).calculateComponents(12, 360, 180);

      expect(result.headwind).toBeCloseTo(-12, 3);
      expect(Math.abs(result.crosswind)).toBeLessThan(0.01);
      expect(result.crosswindFrom).toBe('none');
    });

    it('normalizes direction values over 360°', () => {
      const tool = new HeadCrossWind();

      expect((tool as any).normalizeDegrees(370)).toBe(10);
      expect((tool as any).normalizeDegrees(-10)).toBe(350);
    });
  });

  describe('Tool integration', () => {
    it('has correct metadata', () => {
      const tool = new HeadCrossWind();

      expect(tool.id).toBe('head-cross-wind');
      expect(tool.name).toBe('Head/Cross Wind');
      expect(tool.description.length).toBeGreaterThan(0);
    });

    it('renders and destroys without errors', () => {
      const tool = new HeadCrossWind();
      const container = document.createElement('div');

      expect(() => tool.render(container)).not.toThrow();
      expect(() => tool.destroy()).not.toThrow();
    });
  });
});
