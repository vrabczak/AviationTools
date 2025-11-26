import { describe, it, expect } from 'vitest';
import { DistanceConversion } from '../DistanceConversion';

describe('DistanceConversion', () => {
  describe('Distance Conversion Calculations', () => {
    const tool = new DistanceConversion();
    const convert = (value: number, from: string, to: string) =>
      (tool as any).convert(value, from, to);

    it('should convert meters to kilometers correctly', () => {
      expect(convert(1000, 'm', 'km')).toBeCloseTo(1, 6);
      expect(convert(5000, 'm', 'km')).toBeCloseTo(5, 6);
      expect(convert(500, 'm', 'km')).toBeCloseTo(0.5, 6);
    });

    it('should convert kilometers to meters correctly', () => {
      expect(convert(1, 'km', 'm')).toBeCloseTo(1000, 6);
      expect(convert(2.5, 'km', 'm')).toBeCloseTo(2500, 6);
    });

    it('should convert nautical miles to meters correctly', () => {
      // 1 NM = 1852 m
      expect(convert(1, 'nm', 'm')).toBeCloseTo(1852, 6);
      expect(convert(5, 'nm', 'm')).toBeCloseTo(9260, 6);
    });

    it('should convert meters to nautical miles correctly', () => {
      expect(convert(1852, 'm', 'nm')).toBeCloseTo(1, 6);
      expect(convert(9260, 'm', 'nm')).toBeCloseTo(5, 2);
    });

    it('should convert feet to meters correctly', () => {
      // 1 ft = 0.3048 m
      expect(convert(1, 'ft', 'm')).toBeCloseTo(0.3048, 6);
      expect(convert(100, 'ft', 'm')).toBeCloseTo(30.48, 6);
      expect(convert(3281, 'ft', 'm')).toBeCloseTo(1000.0488, 2);
    });

    it('should convert meters to feet correctly', () => {
      expect(convert(1, 'm', 'ft')).toBeCloseTo(3.28084, 4);
      expect(convert(1000, 'm', 'ft')).toBeCloseTo(3280.84, 1);
    });

    it('should convert statute miles to meters correctly', () => {
      // 1 SM = 1609.344 m
      expect(convert(1, 'sm', 'm')).toBeCloseTo(1609.344, 6);
      expect(convert(5, 'sm', 'm')).toBeCloseTo(8046.72, 6);
    });

    it('should convert meters to statute miles correctly', () => {
      expect(convert(1609.344, 'm', 'sm')).toBeCloseTo(1, 6);
      expect(convert(8046.72, 'm', 'sm')).toBeCloseTo(5, 6);
    });

    it('should convert nautical miles to kilometers correctly', () => {
      // 1 NM = 1.852 km
      expect(convert(1, 'nm', 'km')).toBeCloseTo(1.852, 6);
      expect(convert(10, 'nm', 'km')).toBeCloseTo(18.52, 6);
    });

    it('should convert kilometers to nautical miles correctly', () => {
      expect(convert(1.852, 'km', 'nm')).toBeCloseTo(1, 6);
      expect(convert(18.52, 'km', 'nm')).toBeCloseTo(10, 6);
    });

    it('should convert nautical miles to statute miles correctly', () => {
      // 1 NM = 1.15078 SM
      expect(convert(1, 'nm', 'sm')).toBeCloseTo(1.15078, 4);
    });

    it('should convert statute miles to nautical miles correctly', () => {
      // 1 SM = 0.868976 NM
      expect(convert(1, 'sm', 'nm')).toBeCloseTo(0.868976, 4);
    });

    it('should convert feet to nautical miles correctly', () => {
      // 6076.12 ft ≈ 1 NM
      expect(convert(6076.12, 'ft', 'nm')).toBeCloseTo(1, 3);
    });

    it('should convert nautical miles to feet correctly', () => {
      // 1 NM ≈ 6076.12 ft
      expect(convert(1, 'nm', 'ft')).toBeCloseTo(6076.12, 1);
    });

    it('should handle identity conversions', () => {
      expect(convert(100, 'm', 'm')).toBeCloseTo(100, 6);
      expect(convert(50, 'km', 'km')).toBeCloseTo(50, 6);
      expect(convert(25, 'nm', 'nm')).toBeCloseTo(25, 6);
      expect(convert(1000, 'ft', 'ft')).toBeCloseTo(1000, 6);
      expect(convert(10, 'sm', 'sm')).toBeCloseTo(10, 6);
    });

    it('should handle zero values', () => {
      expect(convert(0, 'm', 'km')).toBe(0);
      expect(convert(0, 'nm', 'ft')).toBe(0);
      expect(convert(0, 'sm', 'm')).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(convert(0.5, 'km', 'm')).toBeCloseTo(500, 6);
      expect(convert(1.5, 'nm', 'km')).toBeCloseTo(2.778, 3);
    });

    it('should handle large values', () => {
      expect(convert(1000000, 'm', 'km')).toBeCloseTo(1000, 6);
      expect(convert(1000, 'nm', 'km')).toBeCloseTo(1852, 6);
    });
  });

  describe('Tool Integration', () => {
    it('should have correct metadata', () => {
      const tool = new DistanceConversion();

      expect(tool.id).toBe('distance-conversion');
      expect(tool.name).toBe('Distance Conversion');
      expect(tool.description).toBeTruthy();
    });

    it('should create and destroy without errors', () => {
      const tool = new DistanceConversion();
      const mockContainer = document.createElement('div');

      expect(() => {
        tool.render(mockContainer);
      }).not.toThrow();

      expect(() => {
        tool.destroy();
      }).not.toThrow();
    });

    it('should render input fields', () => {
      const tool = new DistanceConversion();
      const mockContainer = document.createElement('div');

      tool.render(mockContainer);

      const unitSelect = mockContainer.querySelector('#distance-unit');
      const distanceInput = mockContainer.querySelector('#distance-input');
      const convertBtn = mockContainer.querySelector('#convert-distance');

      expect(unitSelect).not.toBeNull();
      expect(distanceInput).not.toBeNull();
      expect(convertBtn).not.toBeNull();
    });

    it('should render all unit options', () => {
      const tool = new DistanceConversion();
      const mockContainer = document.createElement('div');

      tool.render(mockContainer);

      const unitSelect = mockContainer.querySelector('#distance-unit') as HTMLSelectElement;
      const options = Array.from(unitSelect.options).map(opt => opt.value);

      expect(options).toContain('m');
      expect(options).toContain('km');
      expect(options).toContain('nm');
      expect(options).toContain('ft');
      expect(options).toContain('sm');
      expect(options.length).toBe(5);
    });
  });

  describe('Number Formatting', () => {
    const tool = new DistanceConversion();
    const formatNumber = (value: number) => (tool as any).formatNumber(value);

    it('should format large numbers with 1 decimal', () => {
      expect(formatNumber(1234.5678)).toBe('1234.6');
      expect(formatNumber(10000)).toBe('10000.0');
    });

    it('should format medium numbers with 2 decimals', () => {
      expect(formatNumber(123.456)).toBe('123.46');
      expect(formatNumber(500.999)).toBe('501.00');
    });

    it('should format small-medium numbers with 3 decimals', () => {
      expect(formatNumber(12.3456)).toBe('12.346');
      expect(formatNumber(99.9999)).toBe('100.000');
    });

    it('should format small numbers with 4 decimals', () => {
      expect(formatNumber(1.23456)).toBe('1.2346');
      expect(formatNumber(0.12345)).toBe('0.1235');
    });
  });
});
