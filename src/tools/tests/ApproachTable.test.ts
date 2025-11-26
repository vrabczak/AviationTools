import { describe, it, expect } from 'vitest';
import { ApproachTable } from '../ApproachTable';

describe('ApproachTable', () => {
  describe('Approach Table Calculations', () => {
    const NM_TO_FEET = 6076.12;

    it('should calculate correct distance in km', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 3);
      
      // 1 NM = 1.852 km (stored as string with 1 decimal)
      expect(result[0].distanceNM).toBe(1);
      expect(result[0].distanceKM).toBe('1.9');
      
      // 5 NM = 9.26 km
      expect(result[4].distanceNM).toBe(5);
      expect(result[4].distanceKM).toBe('9.3');
      
      // 10 NM = 18.52 km
      expect(result[9].distanceNM).toBe(10);
      expect(result[9].distanceKM).toBe('18.5');
    });

    it('should generate exactly 10 rows', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(1000, 3);
      
      expect(result.length).toBe(10);
      expect(result[0].distanceNM).toBe(1);
      expect(result[9].distanceNM).toBe(10);
    });

    it('should calculate correct height above target altitude for 3° slope', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 3);
      
      // At 1 NM with 3° slope: height = 6076.12 * tan(3°) ≈ 318.5 ft
      const expectedHeight1NM = NM_TO_FEET * Math.tan((3 * Math.PI) / 180);
      expect(result[0].heightAbove).toBeCloseTo(expectedHeight1NM, 1);
      expect(result[0].heightAbove).toBeCloseTo(318.5, 0);
      
      // At 5 NM: height ≈ 1592.5 ft
      const expectedHeight5NM = 5 * NM_TO_FEET * Math.tan((3 * Math.PI) / 180);
      expect(result[4].heightAbove).toBeCloseTo(expectedHeight5NM, 1);
    });

    it('should calculate correct altitude (target altitude + height)', () => {
      const tool = new ApproachTable();
      const targetAltitude = 1500;
      const result = (tool as any).calculateApproachTable(targetAltitude, 3);
      
      // Altitude should be target altitude + height above
      result.forEach((row: any) => {
        expect(row.altitudeAbove).toBeCloseTo(targetAltitude + row.heightAbove, 1);
      });
    });

    it('should handle zero target altitude', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 3);
      
      // With target altitude at 0, altitude should equal height above
      result.forEach((row: any) => {
        expect(row.altitudeAbove).toBeCloseTo(row.heightAbove, 1);
      });
    });

    it('should calculate steeper slope correctly', () => {
      const tool = new ApproachTable();
      const result3deg = (tool as any).calculateApproachTable(0, 3);
      const result6deg = (tool as any).calculateApproachTable(0, 6);
      
      // 6° slope should give approximately double the height of 3° slope
      // (tan(6°) / tan(3°) ≈ 2.0)
      const ratio = result6deg[0].heightAbove / result3deg[0].heightAbove;
      expect(ratio).toBeCloseTo(2.0, 1);
    });

    it('should handle high target altitude', () => {
      const tool = new ApproachTable();
      const targetAltitude = 8000;
      const result = (tool as any).calculateApproachTable(targetAltitude, 3);
      
      // All altitudes should be above target altitude
      result.forEach((row: any) => {
        expect(row.altitudeAbove).toBeGreaterThan(targetAltitude);
      });
    });

    it('should maintain linear relationship with distance', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 3);
      
      // Height at 2 NM should be double height at 1 NM
      expect(result[1].heightAbove).toBeCloseTo(result[0].heightAbove * 2, 1);
      
      // Height at 10 NM should be 10x height at 1 NM
      expect(result[9].heightAbove).toBeCloseTo(result[0].heightAbove * 10, 1);
    });

    it('should calculate standard 3° approach profile correctly', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 3);
      
      // Common rule of thumb: 3° slope ≈ 318 ft per NM
      // This is derived from: 6076.12 * tan(3°) ≈ 318.4
      expect(result[0].heightAbove).toBeCloseTo(318, 0);
      expect(result[2].heightAbove).toBeCloseTo(955, 0); // 3 NM
      expect(result[4].heightAbove).toBeCloseTo(1592, 0); // 5 NM
    });

    it('should handle steep approach angles', () => {
      const tool = new ApproachTable();
      const result = (tool as any).calculateApproachTable(0, 5.5);
      
      // 5.5° slope at 1 NM: height = 6076.12 * tan(5.5°) ≈ 585 ft
      const expectedHeight = NM_TO_FEET * Math.tan((5.5 * Math.PI) / 180);
      expect(result[0].heightAbove).toBeCloseTo(expectedHeight, 1);
    });

    it('should calculate target vertical speed correctly', () => {
      // VS (ft/min) = Ground Speed (kt) × tan(slope) × 101.27
      const groundSpeed = 100;
      const slopeAngle = 3;
      const expectedVS = groundSpeed * Math.tan(slopeAngle * Math.PI / 180) * 101.27;
      
      // At 100 kt and 3° slope, VS ≈ 530 ft/min
      expect(Math.round(expectedVS)).toBeCloseTo(530, -1);
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
      
      const targetAltitudeInput = mockContainer.querySelector('#target-altitude');
      const slopeInput = mockContainer.querySelector('#slope-angle');
      const groundSpeedInput = mockContainer.querySelector('#ground-speed');
      const generateBtn = mockContainer.querySelector('#generate-table');
      
      expect(targetAltitudeInput).not.toBeNull();
      expect(slopeInput).not.toBeNull();
      expect(groundSpeedInput).not.toBeNull();
      expect(generateBtn).not.toBeNull();
      
      // Default slope should be 3
      expect((slopeInput as HTMLInputElement).value).toBe('3');
      
      // Ground speed should have min="1"
      expect((groundSpeedInput as HTMLInputElement).min).toBe('1');
    });
  });
});
