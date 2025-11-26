import { describe, it, expect } from 'vitest';
import { ApproachTable } from '../ApproachTable';

describe('ApproachTable', () => {
  describe('Approach Table Calculations', () => {
    const NM_TO_FEET = 6076.12;

    it('should calculate correct distance in km', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 3);
      
      // 1 NM = 1.852 km
      expect(result[0].distanceNM).toBe(1);
      expect(result[0].distanceKm).toBeCloseTo(1.852, 3);
      
      // 5 NM = 9.26 km
      expect(result[4].distanceNM).toBe(5);
      expect(result[4].distanceKm).toBeCloseTo(9.26, 2);
      
      // 10 NM = 18.52 km
      expect(result[9].distanceNM).toBe(10);
      expect(result[9].distanceKm).toBeCloseTo(18.52, 2);
    });

    it('should generate exactly 10 rows', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(1000, 3);
      
      expect(result.length).toBe(10);
      expect(result[0].distanceNM).toBe(1);
      expect(result[9].distanceNM).toBe(10);
    });

    it('should calculate correct height above TDZ for 3° slope', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 3);
      
      // At 1 NM with 3° slope: height = 6076.12 * tan(3°) ≈ 318.5 ft
      const expectedHeight1NM = NM_TO_FEET * Math.tan((3 * Math.PI) / 180);
      expect(result[0].heightAboveTDZ).toBeCloseTo(expectedHeight1NM, 1);
      expect(result[0].heightAboveTDZ).toBeCloseTo(318.5, 0);
      
      // At 5 NM: height ≈ 1592.5 ft
      const expectedHeight5NM = 5 * NM_TO_FEET * Math.tan((3 * Math.PI) / 180);
      expect(result[4].heightAboveTDZ).toBeCloseTo(expectedHeight5NM, 1);
    });

    it('should calculate correct altitude (TDZ + height)', () => {
      const tool = new ApproachTable();
      const tdzAltitude = 1500;
      const result = (tool as any).calculateApproachTable(tdzAltitude, 3);
      
      // Altitude should be TDZ altitude + height above TDZ
      result.forEach((row: any) => {
        expect(row.altitude).toBeCloseTo(tdzAltitude + row.heightAboveTDZ, 1);
      });
    });

    it('should handle zero TDZ altitude', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 3);
      
      // With TDZ at 0, altitude should equal height above TDZ
      result.forEach((row: any) => {
        expect(row.altitude).toBeCloseTo(row.heightAboveTDZ, 1);
      });
    });

    it('should calculate steeper slope correctly', () => {
      const tool = new ApproachTable();
      const result3deg = (tool as any).calculateApproachTable(0, 3);
      const result6deg = (tool as any).calculateApproachTable(0, 6);
      
      // 6° slope should give approximately double the height of 3° slope
      // (tan(6°) / tan(3°) ≈ 2.0)
      const ratio = result6deg[0].heightAboveTDZ / result3deg[0].heightAboveTDZ;
      expect(ratio).toBeCloseTo(2.0, 1);
    });

    it('should handle high TDZ altitude', () => {
      const tool = new ApproachTable();
      const tdzAltitude = 8000;
      const result = (tool as any).calculateApproachTable(tdzAltitude, 3);
      
      // All altitudes should be above TDZ
      result.forEach((row: any) => {
        expect(row.altitude).toBeGreaterThan(tdzAltitude);
      });
    });

    it('should maintain linear relationship with distance', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 3);
      
      // Height at 2 NM should be double height at 1 NM
      expect(result[1].heightAboveTDZ).toBeCloseTo(result[0].heightAboveTDZ * 2, 1);
      
      // Height at 10 NM should be 10x height at 1 NM
      expect(result[9].heightAboveTDZ).toBeCloseTo(result[0].heightAboveTDZ * 10, 1);
    });

    it('should calculate standard 3° approach profile correctly', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 3);
      
      // Common rule of thumb: 3° slope ≈ 318 ft per NM
      // This is derived from: 6076.12 * tan(3°) ≈ 318.4
      expect(result[0].heightAboveTDZ).toBeCloseTo(318, 0);
      expect(result[2].heightAboveTDZ).toBeCloseTo(955, 0); // 3 NM
      expect(result[4].heightAboveTDZ).toBeCloseTo(1592, 0); // 5 NM
    });

    it('should handle steep approach angles', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 5.5);
      
      // 5.5° slope at 1 NM: height = 6076.12 * tan(5.5°) ≈ 585 ft
      const expectedHeight = NM_TO_FEET * Math.tan((5.5 * Math.PI) / 180);
      expect(result[0].heightAboveTDZ).toBeCloseTo(expectedHeight, 1);
    });
  });

  describe('Tool Integration', () => {
    it('should have correct metadata', () => {
      const tool = new ApproachTable();
      
      expect(tool.id).toBe('approach-table');
      expect(tool.name).toBe('Approach Table');
      expect(tool.description).toBeTruthy();
    });

    it('should create and destroy without errors', () => {
      const tool = new ApproachTable();
      const mockContainer = document.createElement('div');
      
      expect(() => {
        tool.render(mockContainer);
      }).not.toThrow();
      
      expect(() => {
        tool.destroy();
      }).not.toThrow();
    });

    it('should render input fields', () => {
      const tool = new ApproachTable();
      const mockContainer = document.createElement('div');
      
      tool.render(mockContainer);
      
      const tdzInput = mockContainer.querySelector('#tdz-altitude');
      const slopeInput = mockContainer.querySelector('#slope-angle');
      const generateBtn = mockContainer.querySelector('#generate-table');
      
      expect(tdzInput).not.toBeNull();
      expect(slopeInput).not.toBeNull();
      expect(generateBtn).not.toBeNull();
      
      // Default slope should be 3
      expect((slopeInput as HTMLInputElement).value).toBe('3');
    });
  });
});
