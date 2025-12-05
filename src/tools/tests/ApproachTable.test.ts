import { describe, it, expect } from 'vitest';
import { approachTableTool, calculateApproachTable } from '../ApproachTable';

describe('ApproachTable', () => {
  const NM_TO_FEET = 6076.12;

  describe('Approach Table Calculations', () => {
    it('calculates correct distance in km', () => {
      const result = calculateApproachTable(0, 3);
      expect(result[0].distanceNM).toBe(1);
      expect(result[0].distanceKM).toBe('1.9');
      expect(result[4].distanceNM).toBe(5);
      expect(result[4].distanceKM).toBe('9.3');
      expect(result[9].distanceNM).toBe(10);
      expect(result[9].distanceKM).toBe('18.5');
    });

    it('generates exactly 10 rows', () => {
      const result = calculateApproachTable(1000, 3);
      expect(result.length).toBe(10);
      expect(result[0].distanceNM).toBe(1);
      expect(result[9].distanceNM).toBe(10);
    });

    it('calculates correct height above target altitude for 3° slope', () => {
      const result = calculateApproachTable(0, 3);
      const expectedHeight1NM = NM_TO_FEET * Math.tan((3 * Math.PI) / 180);
      expect(result[0].heightAbove).toBeCloseTo(expectedHeight1NM, 1);
      expect(result[0].heightAbove).toBeCloseTo(318.5, 0);

      const expectedHeight5NM = 5 * NM_TO_FEET * Math.tan((3 * Math.PI) / 180);
      expect(result[4].heightAbove).toBeCloseTo(expectedHeight5NM, 1);
    });

    it('calculates altitude as target altitude + height', () => {
      const targetAltitude = 1500;
      const result = calculateApproachTable(targetAltitude, 3);
      result.forEach((row) => {
        expect(row.altitudeAbove).toBeCloseTo(targetAltitude + row.heightAbove, 1);
      });
    });

    it('handles steep approach angles', () => {
      const result3deg = calculateApproachTable(0, 3);
      const result6deg = calculateApproachTable(0, 6);
      const ratio = result6deg[0].heightAbove / result3deg[0].heightAbove;
      expect(ratio).toBeCloseTo(2.0, 1);
    });
  });

  describe('Tool Metadata', () => {
    it('exposes correct metadata', () => {
      expect(approachTableTool.id).toBe('approach-table');
      expect(approachTableTool.name).toBe('Approach Table');
      expect(approachTableTool.description).toBeTruthy();
    });
  });
});
