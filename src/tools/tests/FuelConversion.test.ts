import { describe, it, expect } from 'vitest';
import { FuelConversion } from '../FuelConversion';

describe('FuelConversion', () => {
  describe('Fuel Conversion Calculations', () => {
    const tool = new FuelConversion();
    const convertToLiters = (value: number, unit: string, density: number) =>
      (tool as any).convertToLiters(value, unit, density);

    const LITERS_PER_GALLON = 3.785411784;
    const KG_PER_POUND = 0.45359237;
    const DEFAULT_DENSITY = 0.8;

    describe('convertToLiters', () => {
      it('should return liters unchanged', () => {
        expect(convertToLiters(100, 'liters', DEFAULT_DENSITY)).toBe(100);
        expect(convertToLiters(50.5, 'liters', DEFAULT_DENSITY)).toBe(50.5);
        expect(convertToLiters(0, 'liters', DEFAULT_DENSITY)).toBe(0);
      });

      it('should convert kg to liters correctly', () => {
        // liters = kg / density
        expect(convertToLiters(80, 'kg', 0.8)).toBeCloseTo(100, 6);
        expect(convertToLiters(100, 'kg', 0.8)).toBeCloseTo(125, 6);
        expect(convertToLiters(72, 'kg', 0.72)).toBeCloseTo(100, 6);
      });

      it('should convert gallons to liters correctly', () => {
        // liters = gallons * LITERS_PER_GALLON
        expect(convertToLiters(1, 'gallon', DEFAULT_DENSITY)).toBeCloseTo(LITERS_PER_GALLON, 6);
        expect(convertToLiters(10, 'gallon', DEFAULT_DENSITY)).toBeCloseTo(37.85411784, 6);
        expect(convertToLiters(0, 'gallon', DEFAULT_DENSITY)).toBe(0);
      });

      it('should convert pounds to liters correctly', () => {
        // liters = (pounds * KG_PER_POUND) / density
        const poundsToLiters = (lb: number, density: number) => (lb * KG_PER_POUND) / density;
        expect(convertToLiters(100, 'pound', 0.8)).toBeCloseTo(poundsToLiters(100, 0.8), 6);
        expect(convertToLiters(220.46, 'pound', 0.8)).toBeCloseTo(poundsToLiters(220.46, 0.8), 4);
      });

      it('should handle different densities correctly', () => {
        // Jet A-1: ~0.8 kg/L
        expect(convertToLiters(80, 'kg', 0.8)).toBeCloseTo(100, 6);
        // Avgas 100LL: ~0.72 kg/L
        expect(convertToLiters(72, 'kg', 0.72)).toBeCloseTo(100, 6);
        // Higher density fuel
        expect(convertToLiters(85, 'kg', 0.85)).toBeCloseTo(100, 6);
      });
    });

    describe('Full conversion chain', () => {
      it('should correctly convert liters to all units', () => {
        const liters = 100;
        const density = 0.8;

        const kg = liters * density;
        const gallon = liters / LITERS_PER_GALLON;
        const pound = kg / KG_PER_POUND;

        expect(kg).toBeCloseTo(80, 6);
        expect(gallon).toBeCloseTo(26.4172, 4);
        expect(pound).toBeCloseTo(176.37, 2);
      });

      it('should correctly round-trip conversions', () => {
        const originalLiters = 100;
        const density = 0.8;

        // Convert liters -> kg -> liters
        const kg = originalLiters * density;
        const backToLiters = convertToLiters(kg, 'kg', density);
        expect(backToLiters).toBeCloseTo(originalLiters, 6);

        // Convert liters -> gallons -> liters
        const gallons = originalLiters / LITERS_PER_GALLON;
        const backFromGallons = convertToLiters(gallons, 'gallon', density);
        expect(backFromGallons).toBeCloseTo(originalLiters, 6);

        // Convert liters -> pounds -> liters
        const pounds = (originalLiters * density) / KG_PER_POUND;
        const backFromPounds = convertToLiters(pounds, 'pound', density);
        expect(backFromPounds).toBeCloseTo(originalLiters, 6);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero values', () => {
        expect(convertToLiters(0, 'liters', 0.8)).toBe(0);
        expect(convertToLiters(0, 'kg', 0.8)).toBe(0);
        expect(convertToLiters(0, 'gallon', 0.8)).toBe(0);
        expect(convertToLiters(0, 'pound', 0.8)).toBe(0);
      });

      it('should handle very small values', () => {
        expect(convertToLiters(0.001, 'liters', 0.8)).toBeCloseTo(0.001, 6);
        expect(convertToLiters(0.001, 'kg', 0.8)).toBeCloseTo(0.00125, 6);
      });

      it('should handle very large values', () => {
        expect(convertToLiters(100000, 'liters', 0.8)).toBe(100000);
        expect(convertToLiters(80000, 'kg', 0.8)).toBeCloseTo(100000, 6);
      });
    });
  });

  describe('Tool Integration', () => {
    it('should have correct metadata', () => {
      const tool = new FuelConversion();

      expect(tool.id).toBe('fuel-conversion');
      expect(tool.name).toBe('Fuel Conversion');
      expect(tool.description).toBeTruthy();
    });

    it('should create and destroy without errors', () => {
      const tool = new FuelConversion();
      const mockContainer = document.createElement('div');

      expect(() => {
        tool.render(mockContainer);
      }).not.toThrow();

      expect(() => {
        tool.destroy();
      }).not.toThrow();
    });

    it('should render input fields', () => {
      const tool = new FuelConversion();
      const mockContainer = document.createElement('div');

      tool.render(mockContainer);

      const unitSelect = mockContainer.querySelector('#fuel-unit');
      const valueInput = mockContainer.querySelector('#fuel-value');
      const densityInput = mockContainer.querySelector('#fuel-density');
      const convertBtn = mockContainer.querySelector('#convert-fuel');

      expect(unitSelect).not.toBeNull();
      expect(valueInput).not.toBeNull();
      expect(densityInput).not.toBeNull();
      expect(convertBtn).not.toBeNull();
    });

    it('should render all unit options', () => {
      const tool = new FuelConversion();
      const mockContainer = document.createElement('div');

      tool.render(mockContainer);

      const unitSelect = mockContainer.querySelector('#fuel-unit') as HTMLSelectElement;
      const options = Array.from(unitSelect.options).map(opt => opt.value);

      expect(options).toContain('liters');
      expect(options).toContain('kg');
      expect(options).toContain('gallon');
      expect(options).toContain('pound');
      expect(options.length).toBe(4);
    });

    it('should have default density of 0.8', () => {
      const tool = new FuelConversion();
      const mockContainer = document.createElement('div');

      tool.render(mockContainer);

      const densityInput = mockContainer.querySelector('#fuel-density') as HTMLInputElement;
      expect(densityInput.value).toBe('0.8');
    });

    it('should render result fields', () => {
      const tool = new FuelConversion();
      const mockContainer = document.createElement('div');

      tool.render(mockContainer);

      expect(mockContainer.querySelector('#result-liters')).not.toBeNull();
      expect(mockContainer.querySelector('#result-kg')).not.toBeNull();
      expect(mockContainer.querySelector('#result-gallon')).not.toBeNull();
      expect(mockContainer.querySelector('#result-pound')).not.toBeNull();
    });

    it('should have result section hidden initially', () => {
      const tool = new FuelConversion();
      const mockContainer = document.createElement('div');

      tool.render(mockContainer);

      const resultSection = mockContainer.querySelector('#fuel-result');
      expect(resultSection?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Conversion Constants', () => {
    it('should use correct liters per gallon constant', () => {
      const tool = new FuelConversion();
      expect((tool as any).LITERS_PER_GALLON).toBeCloseTo(3.785411784, 9);
    });

    it('should use correct kg per pound constant', () => {
      const tool = new FuelConversion();
      expect((tool as any).KG_PER_POUND).toBeCloseTo(0.45359237, 8);
    });
  });
});
