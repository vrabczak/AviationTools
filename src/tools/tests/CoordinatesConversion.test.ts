import { describe, it, expect, beforeEach } from 'vitest';
import { CoordinatesConversion } from '../CoordinatesConversion';

describe('CoordinatesConversion', () => {
  let tool: CoordinatesConversion;
  let container: HTMLElement;

  beforeEach(() => {
    tool = new CoordinatesConversion();
    container = document.createElement('div');
    tool.render(container);
  });

  describe('Tool Metadata', () => {
    it('should have correct metadata', () => {
      expect(tool.id).toBe('coordinates-conversion');
      expect(tool.name).toBe('Coordinates Conversion');
      expect(tool.description).toBeTruthy();
    });
  });

  describe('Decimal Degrees (DD) Parsing', () => {
    it('should parse valid positive decimal degrees', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '48.85837';
      lonInput.value = '2.29448';
      
      const result = (tool as any).parseDecimalDegrees();
      expect(result.lat).toBeCloseTo(48.85837, 5);
      expect(result.lon).toBeCloseTo(2.29448, 5);
    });

    it('should parse negative decimal degrees', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '-33.8688';
      lonInput.value = '-151.2093';
      
      const result = (tool as any).parseDecimalDegrees();
      expect(result.lat).toBeCloseTo(-33.8688, 4);
      expect(result.lon).toBeCloseTo(-151.2093, 4);
    });

    it('should throw error for invalid latitude', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = 'invalid';
      lonInput.value = '2.29448';
      
      expect(() => (tool as any).parseDecimalDegrees()).toThrow('Please provide numeric latitude and longitude values');
    });

    it('should throw error for empty inputs', () => {
      expect(() => (tool as any).parseDecimalDegrees()).toThrow('Please provide numeric latitude and longitude values');
    });

    it('should throw error for latitude out of range', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '95';
      lonInput.value = '2.29448';
      
      expect(() => (tool as any).parseDecimalDegrees()).toThrow('Latitude must be between -90 and 90 degrees');
    });

    it('should throw error for longitude out of range', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '48.85837';
      lonInput.value = '185';
      
      expect(() => (tool as any).parseDecimalDegrees()).toThrow('Longitude must be between -180 and 180 degrees');
    });
  });

  describe('Degrees + Decimal Minutes (DM) Parsing', () => {
    beforeEach(() => {
      const formatSelect = container.querySelector('#coordinate-format') as HTMLSelectElement;
      formatSelect.value = 'dm';
      formatSelect.dispatchEvent(new Event('change'));
    });

    it('should parse DM with suffix direction (N/E)', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = "48° 51.502 N";
      lonInput.value = "2° 17.669 E";
      
      const result = (tool as any).parseDegreesMinutes(false);
      expect(result.lat).toBeCloseTo(48.85837, 4);
      expect(result.lon).toBeCloseTo(2.29448, 4);
    });

    it('should parse DM with suffix direction (S/W)', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = "33° 52.128 S";
      lonInput.value = "151° 12.558 W";
      
      const result = (tool as any).parseDegreesMinutes(false);
      expect(result.lat).toBeCloseTo(-33.8688, 4);
      expect(result.lon).toBeCloseTo(-151.2093, 4);
    });

    it('should parse DM with prefix direction', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = "N 48° 51.502";
      lonInput.value = "E 2° 17.669";
      
      const result = (tool as any).parseDegreesMinutes(false);
      expect(result.lat).toBeCloseTo(48.85837, 4);
      expect(result.lon).toBeCloseTo(2.29448, 4);
    });

    it('should parse DM without quotes', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = "48° 51.502 N";
      lonInput.value = "2° 17.669 E";
      
      const result = (tool as any).parseDegreesMinutes(false);
      expect(result.lat).toBeCloseTo(48.85837, 4);
      expect(result.lon).toBeCloseTo(2.29448, 4);
    });

    it('should throw error for invalid DM format', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = "invalid format";
      lonInput.value = "2° 17.669' E";
      
      expect(() => (tool as any).parseDegreesMinutes(false)).toThrow(/Could not parse DM value/);
    });

    it('should throw error for minutes >= 60', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = "48° 65 N";
      lonInput.value = "2° 17.669 E";
      
      expect(() => (tool as any).parseDegreesMinutes(false)).toThrow('Minutes and seconds must be between 0 and 59');
    });

    it('should throw error for wrong direction on latitude', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = "48° 51.502 E";
      lonInput.value = "2° 17.669 E";
      
      expect(() => (tool as any).parseDegreesMinutes(false)).toThrow(/Use N or S for latitude directions/);
    });

    it('should throw error for wrong direction on longitude', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = "48° 51.502 N";
      lonInput.value = "2° 17.669 N";
      
      expect(() => (tool as any).parseDegreesMinutes(false)).toThrow(/Use E or W for longitude directions/);
    });
  });

  describe('Degrees + Minutes + Seconds (DMS) Parsing', () => {
    beforeEach(() => {
      const formatSelect = container.querySelector('#coordinate-format') as HTMLSelectElement;
      formatSelect.value = 'dms';
      formatSelect.dispatchEvent(new Event('change'));
    });

    it('should parse valid DMS coordinates', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '48° 51 30.1 N';
      lonInput.value = '2° 17 40.1 E';
      
      const result = (tool as any).parseDegreesMinutes(true);
      expect(result.lat).toBeCloseTo(48.85836, 4);
      expect(result.lon).toBeCloseTo(2.29447, 4);
    });

    it('should parse DMS with whole seconds', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '40° 26 46 N';
      lonInput.value = '79° 58 56 W';
      
      const result = (tool as any).parseDegreesMinutes(true);
      expect(result.lat).toBeCloseTo(40.44611, 4);
      expect(result.lon).toBeCloseTo(-79.98222, 4);
    });

    it('should throw error when seconds are missing', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '48° 51 N';
      lonInput.value = '2° 17 E';
      
      expect(() => (tool as any).parseDegreesMinutes(true)).toThrow('Please include seconds for DMS coordinates');
    });

    it('should throw error when direction is missing', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '48° 51 30.1';
      lonInput.value = '2° 17 40.1 E';
      
      expect(() => (tool as any).parseDegreesMinutes(true)).toThrow(/Please include N\/S or E\/W for the latitude DMS value/);
    });

    it('should throw error for seconds >= 60', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '48° 51 65 N';
      lonInput.value = '2° 17 40 E';
      
      expect(() => (tool as any).parseDegreesMinutes(true)).toThrow('Minutes and seconds must be between 0 and 59');
    });
  });

  describe('MGRS Parsing', () => {
    beforeEach(() => {
      const formatSelect = container.querySelector('#coordinate-format') as HTMLSelectElement;
      formatSelect.value = 'mgrs';
      formatSelect.dispatchEvent(new Event('change'));
    });

    it('should parse valid 5-digit MGRS coordinate', () => {
      const mgrsInput = container.querySelector('#mgrs-input') as HTMLInputElement;
      // Paris: 48.8566°N, 2.3522°E -> 31UDQ4821706489 (but using a simpler known coordinate)
      mgrsInput.value = '33UXP0400651000';
      
      const result = (tool as any).parseMgrs();
      // Just verify it parses without error and returns valid coordinates
      expect(result.lat).toBeGreaterThan(0);
      expect(result.lon).toBeGreaterThan(0);
      expect(result.lat).toBeLessThan(90);
      expect(result.lon).toBeLessThan(180);
    });

    it('should parse MGRS with spaces', () => {
      const mgrsInput = container.querySelector('#mgrs-input') as HTMLInputElement;
      mgrsInput.value = '33U XP 04006 51000';
      
      const result = (tool as any).parseMgrs();
      // Just verify it parses without error and returns valid coordinates
      expect(result.lat).toBeGreaterThan(0);
      expect(result.lon).toBeGreaterThan(0);
      expect(result.lat).toBeLessThan(90);
      expect(result.lon).toBeLessThan(180);
    });

    it('should throw error for empty MGRS input', () => {
      const mgrsInput = container.querySelector('#mgrs-input') as HTMLInputElement;
      mgrsInput.value = '';
      
      expect(() => (tool as any).parseMgrs()).toThrow('Please enter an MGRS coordinate');
    });

    it('should throw error for invalid MGRS coordinate', () => {
      const mgrsInput = container.querySelector('#mgrs-input') as HTMLInputElement;
      mgrsInput.value = 'INVALID';
      
      expect(() => (tool as any).parseMgrs()).toThrow('Invalid MGRS coordinate');
    });
  });

  describe('Coordinate Formatting', () => {
    it('should format positive latitude as degrees and minutes', () => {
      const result = (tool as any).formatDegreesMinutes(48.85837, true);
      expect(result).toMatch(/48°51\.502'N/);
    });

    it('should format negative latitude as degrees and minutes', () => {
      const result = (tool as any).formatDegreesMinutes(-33.8688, true);
      expect(result).toMatch(/33°52\.128'S/);
    });

    it('should format positive longitude as degrees and minutes', () => {
      const result = (tool as any).formatDegreesMinutes(2.29448, false);
      expect(result).toMatch(/2°17\.669'E/);
    });

    it('should format negative longitude as degrees and minutes', () => {
      const result = (tool as any).formatDegreesMinutes(-151.2093, false);
      expect(result).toMatch(/151°12\.558'W/);
    });

    it('should format latitude as DMS', () => {
      const result = (tool as any).formatDms(48.85837, true);
      expect(result).toMatch(/48°51'30\.1"N/);
    });

    it('should format longitude as DMS', () => {
      const result = (tool as any).formatDms(2.29448, false);
      expect(result).toMatch(/2°17'40\.1"E/);
    });

    it('should format zero latitude correctly', () => {
      const result = (tool as any).formatDms(0, true);
      expect(result).toMatch(/0°0'0\.0"N/);
    });

    it('should format zero longitude correctly', () => {
      const result = (tool as any).formatDms(0, false);
      expect(result).toMatch(/0°0'0\.0"E/);
    });
  });

  describe('Direction Helpers', () => {
    it('should return N for positive latitude', () => {
      const result = (tool as any).getDirection(48.85837, true);
      expect(result).toBe('N');
    });

    it('should return S for negative latitude', () => {
      const result = (tool as any).getDirection(-33.8688, true);
      expect(result).toBe('S');
    });

    it('should return E for positive longitude', () => {
      const result = (tool as any).getDirection(2.29448, false);
      expect(result).toBe('E');
    });

    it('should return W for negative longitude', () => {
      const result = (tool as any).getDirection(-151.2093, false);
      expect(result).toBe('W');
    });

    it('should return N for zero latitude', () => {
      const result = (tool as any).getDirection(0, true);
      expect(result).toBe('N');
    });

    it('should return E for zero longitude', () => {
      const result = (tool as any).getDirection(0, false);
      expect(result).toBe('E');
    });
  });

  describe('Validation', () => {
    it('should accept valid latitude at boundary', () => {
      expect(() => (tool as any).validateRange(90, 0)).not.toThrow();
      expect(() => (tool as any).validateRange(-90, 0)).not.toThrow();
    });

    it('should accept valid longitude at boundary', () => {
      expect(() => (tool as any).validateRange(0, 180)).not.toThrow();
      expect(() => (tool as any).validateRange(0, -180)).not.toThrow();
    });

    it('should reject latitude > 90', () => {
      expect(() => (tool as any).validateRange(90.1, 0)).toThrow('Latitude must be between -90 and 90 degrees');
    });

    it('should reject latitude < -90', () => {
      expect(() => (tool as any).validateRange(-90.1, 0)).toThrow('Latitude must be between -90 and 90 degrees');
    });

    it('should reject longitude > 180', () => {
      expect(() => (tool as any).validateRange(0, 180.1)).toThrow('Longitude must be between -180 and 180 degrees');
    });

    it('should reject longitude < -180', () => {
      expect(() => (tool as any).validateRange(0, -180.1)).toThrow('Longitude must be between -180 and 180 degrees');
    });
  });

  describe('Integration Tests', () => {
    it('should render all input formats correctly', () => {
      const formatSelect = container.querySelector('#coordinate-format') as HTMLSelectElement;
      
      // DD format
      formatSelect.value = 'dd';
      formatSelect.dispatchEvent(new Event('change'));
      expect(container.querySelector('#lat-input')).toBeTruthy();
      expect(container.querySelector('#lon-input')).toBeTruthy();
      
      // MGRS format
      formatSelect.value = 'mgrs';
      formatSelect.dispatchEvent(new Event('change'));
      expect(container.querySelector('#mgrs-input')).toBeTruthy();
    });

    it('should convert and display results', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      const convertBtn = container.querySelector('#convert-coordinates') as HTMLButtonElement;
      
      latInput.value = '48.85837';
      lonInput.value = '2.29448';
      convertBtn.click();
      
      const resultCard = container.querySelector('#conversion-result');
      expect(resultCard?.classList.contains('hidden')).toBe(false);
      
      const ddResult = container.querySelector('#result-dd')?.textContent;
      expect(ddResult).toContain('48.858370');
      expect(ddResult).toContain('2.294480');
    });

    it('should handle conversion errors gracefully', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      const convertBtn = container.querySelector('#convert-coordinates') as HTMLButtonElement;
      
      // Mock alert
      let alertMessage = '';
      window.alert = (msg: string) => { alertMessage = msg; };
      
      latInput.value = 'invalid';
      lonInput.value = '2.29448';
      convertBtn.click();
      
      expect(alertMessage).toContain('numeric latitude and longitude');
    });

    it('should create and destroy without errors', () => {
      const newTool = new CoordinatesConversion();
      const mockContainer = document.createElement('div');
      
      expect(() => {
        newTool.render(mockContainer);
      }).not.toThrow();
      
      expect(() => {
        newTool.destroy();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle coordinates at the equator', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '0';
      lonInput.value = '0';
      
      const result = (tool as any).parseDecimalDegrees();
      expect(result.lat).toBe(0);
      expect(result.lon).toBe(0);
    });

    it('should handle coordinates at poles', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '90';
      lonInput.value = '0';
      
      const result = (tool as any).parseDecimalDegrees();
      expect(result.lat).toBe(90);
    });

    it('should handle date line crossing coordinates', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '0';
      lonInput.value = '180';
      
      const result = (tool as any).parseDecimalDegrees();
      expect(result.lon).toBe(180);
    });

    it('should handle very small decimal values', () => {
      const latInput = container.querySelector('#lat-input') as HTMLInputElement;
      const lonInput = container.querySelector('#lon-input') as HTMLInputElement;
      
      latInput.value = '0.000001';
      lonInput.value = '0.000001';
      
      const result = (tool as any).parseDecimalDegrees();
      expect(result.lat).toBeCloseTo(0.000001, 6);
      expect(result.lon).toBeCloseTo(0.000001, 6);
    });
  });
});
