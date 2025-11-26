import { describe, it, expect } from 'vitest';
import { SpeedConversion } from '../SpeedConversion';

describe('SpeedConversion', () => {
  describe('Speed Conversion Calculations', () => {
    // Conversion constants for verification
    const KT_TO_MS = 0.514444;
    const FTMIN_TO_MS = 0.00508;

    it('should convert knots to km/h correctly', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(100, 'kt', 'kmh');
      
      // 100 kt = 185.2 km/h
      expect(result).toBeCloseTo(185.2, 1);
    });

    it('should convert knots to m/s correctly', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(100, 'kt', 'ms');
      
      // 100 kt = 51.44 m/s
      expect(result).toBeCloseTo(51.44, 2);
    });

    it('should convert knots to ft/min correctly', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(100, 'kt', 'ftmin');
      
      // 100 kt = 10125.98 ft/min
      const expected = 100 * KT_TO_MS / FTMIN_TO_MS;
      expect(result).toBeCloseTo(expected, 1);
    });

    it('should convert km/h to knots correctly', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(185.2, 'kmh', 'kt');
      
      // 185.2 km/h ≈ 100 kt
      expect(result).toBeCloseTo(100, 0);
    });

    it('should convert km/h to m/s correctly', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(36, 'kmh', 'ms');
      
      // 36 km/h = 10 m/s
      expect(result).toBeCloseTo(10, 2);
    });

    it('should convert m/s to knots correctly', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(51.44, 'ms', 'kt');
      
      // 51.44 m/s ≈ 100 kt
      expect(result).toBeCloseTo(100, 0);
    });

    it('should convert m/s to km/h correctly', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(10, 'ms', 'kmh');
      
      // 10 m/s = 36 km/h
      expect(result).toBeCloseTo(36, 2);
    });

    it('should convert m/s to ft/min correctly', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(1, 'ms', 'ftmin');
      
      // 1 m/s = 196.85 ft/min
      expect(result).toBeCloseTo(196.85, 1);
    });

    it('should convert ft/min to m/s correctly', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(196.85, 'ftmin', 'ms');
      
      // 196.85 ft/min ≈ 1 m/s
      expect(result).toBeCloseTo(1, 2);
    });

    it('should convert ft/min to knots correctly', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(10126, 'ftmin', 'kt');
      
      // 10126 ft/min ≈ 100 kt
      expect(result).toBeCloseTo(100, 0);
    });

    it('should return same value when converting to same unit', () => {
      const tool = new SpeedConversion();
      
      expect((tool as any).convert(100, 'kt', 'kt')).toBeCloseTo(100, 5);
      expect((tool as any).convert(200, 'kmh', 'kmh')).toBeCloseTo(200, 5);
      expect((tool as any).convert(50, 'ms', 'ms')).toBeCloseTo(50, 5);
      expect((tool as any).convert(1000, 'ftmin', 'ftmin')).toBeCloseTo(1000, 5);
    });

    it('should handle zero value', () => {
      const tool = new SpeedConversion();
      
      expect((tool as any).convert(0, 'kt', 'kmh')).toBe(0);
      expect((tool as any).convert(0, 'ms', 'ftmin')).toBe(0);
    });

    it('should handle small values', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(1, 'kt', 'ms');
      
      // 1 kt = 0.514444 m/s
      expect(result).toBeCloseTo(0.514444, 5);
    });

    it('should handle large values', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).convert(1000, 'kt', 'kmh');
      
      // 1000 kt = 1852 km/h
      expect(result).toBeCloseTo(1852, 0);
    });

    it('should maintain round-trip accuracy', () => {
      const tool = new SpeedConversion();
      const original = 123.456;
      
      // kt -> kmh -> kt
      const toKmh = (tool as any).convert(original, 'kt', 'kmh');
      const backToKt = (tool as any).convert(toKmh, 'kmh', 'kt');
      expect(backToKt).toBeCloseTo(original, 5);
      
      // ms -> ftmin -> ms
      const toFtmin = (tool as any).convert(original, 'ms', 'ftmin');
      const backToMs = (tool as any).convert(toFtmin, 'ftmin', 'ms');
      expect(backToMs).toBeCloseTo(original, 5);
    });
  });

  describe('Number Formatting', () => {
    it('should format large numbers with 1 decimal', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).formatNumber(1234.5678);
      
      expect(result).toBe('1234.6');
    });

    it('should format medium numbers with 2 decimals', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).formatNumber(123.4567);
      
      expect(result).toBe('123.46');
    });

    it('should format small numbers with 3 decimals', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).formatNumber(12.3456);
      
      expect(result).toBe('12.346');
    });

    it('should format very small numbers with 4 decimals', () => {
      const tool = new SpeedConversion();
      const result = (tool as any).formatNumber(1.23456);
      
      expect(result).toBe('1.2346');
    });
  });

  describe('Tool Integration', () => {
    it('should have correct metadata', () => {
      const tool = new SpeedConversion();
      
      expect(tool.id).toBe('speed-conversion');
      expect(tool.name).toBe('Speed Conversion');
      expect(tool.description).toBeTruthy();
    });

    it('should create and destroy without errors', () => {
      const tool = new SpeedConversion();
      const mockContainer = document.createElement('div');
      
      expect(() => {
        tool.render(mockContainer);
      }).not.toThrow();
      
      expect(() => {
        tool.destroy();
      }).not.toThrow();
    });

    it('should render input fields', () => {
      const tool = new SpeedConversion();
      const mockContainer = document.createElement('div');
      
      tool.render(mockContainer);
      
      const unitSelect = mockContainer.querySelector('#speed-unit');
      const speedInput = mockContainer.querySelector('#speed-input');
      const convertBtn = mockContainer.querySelector('#convert-speed');
      
      expect(unitSelect).not.toBeNull();
      expect(speedInput).not.toBeNull();
      expect(convertBtn).not.toBeNull();
    });

    it('should render all unit options', () => {
      const tool = new SpeedConversion();
      const mockContainer = document.createElement('div');
      
      tool.render(mockContainer);
      
      const unitSelect = mockContainer.querySelector('#speed-unit') as HTMLSelectElement;
      const options = Array.from(unitSelect.options).map(opt => opt.value);
      
      expect(options).toContain('kt');
      expect(options).toContain('kmh');
      expect(options).toContain('ms');
      expect(options).toContain('ftmin');
    });

    it('should render result fields', () => {
      const tool = new SpeedConversion();
      const mockContainer = document.createElement('div');
      
      tool.render(mockContainer);
      
      expect(mockContainer.querySelector('#result-kt')).not.toBeNull();
      expect(mockContainer.querySelector('#result-kmh')).not.toBeNull();
      expect(mockContainer.querySelector('#result-ms')).not.toBeNull();
      expect(mockContainer.querySelector('#result-ftmin')).not.toBeNull();
    });

    it('should have result hidden initially', () => {
      const tool = new SpeedConversion();
      const mockContainer = document.createElement('div');
      
      tool.render(mockContainer);
      
      const resultCard = mockContainer.querySelector('#conversion-result');
      expect(resultCard?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Aviation Speed References', () => {
    it('should convert typical cruise speed correctly', () => {
      const tool = new SpeedConversion();
      
      // Typical jet cruise: 450 kt
      const kmh = (tool as any).convert(450, 'kt', 'kmh');
      expect(kmh).toBeCloseTo(833.4, 0);
    });

    it('should convert typical climb rate correctly', () => {
      const tool = new SpeedConversion();
      
      // Typical climb: 2000 ft/min
      const ms = (tool as any).convert(2000, 'ftmin', 'ms');
      expect(ms).toBeCloseTo(10.16, 1);
    });

    it('should convert typical approach speed correctly', () => {
      const tool = new SpeedConversion();
      
      // Typical approach: 140 kt
      const kmh = (tool as any).convert(140, 'kt', 'kmh');
      expect(kmh).toBeCloseTo(259.3, 0);
    });
  });
});
