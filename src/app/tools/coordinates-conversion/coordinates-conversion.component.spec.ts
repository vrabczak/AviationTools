import {
  buildCoordinateResults,
  coordinatesConversionTool,
  formatDegreesMinutes,
  formatDms,
  formatMgrs,
  parseCoordinateString,
  parseDecimalDegrees,
  parseDegreesMinutes,
  parseMgrs,
  validateRange,
} from './coordinates-conversion.component';

describe('CoordinatesConversion', () => {
  describe('Parsing', () => {
    it('parses decimal degrees', () => {
      const result = parseDecimalDegrees('48.85837', '2.29448');
      expect(result.lat).toBeCloseTo(48.85837, 5);
      expect(result.lon).toBeCloseTo(2.29448, 5);
    });

    it('throws on out of range values', () => {
      expect(() => validateRange(95, 0)).toThrowError(/Latitude/);
      expect(() => validateRange(0, 190)).toThrowError(/Longitude/);
    });

    it('parses DM format', () => {
      const result = parseDegreesMinutes("48° 51.502 N", "2° 17.669 E", false);
      expect(result.lat).toBeCloseTo(48.85837, 4);
      expect(result.lon).toBeCloseTo(2.29448, 4);
    });

    it('parses DMS format', () => {
      const result = parseDegreesMinutes(`50° 5' 42.8" N`, `14° 26' 9.6" E`, true);
      expect(result.lat).toBeCloseTo(50.09522, 4);
      expect(result.lon).toBeCloseTo(14.436, 3);
    });

    it('parses coordinate string with prefix direction', () => {
      const lat = parseCoordinateString('N 48 51.502', false, true);
      expect(lat).toBeCloseTo(48.85837, 4);
    });

    it('throws on invalid DM string', () => {
      expect(() => parseCoordinateString('invalid', false, true)).toThrowError(/Could not parse DM/);
    });

    it('parses MGRS', () => {
      const result = parseMgrs('33UXQ0123456789');
      expect(result.lat).toBeDefined();
      expect(result.lon).toBeDefined();
    });
  });

  describe('Formatting', () => {
    it('formats DM and DMS strings', () => {
      expect(formatDegreesMinutes(48.85837, true)).toContain('N');
      expect(formatDms(2.29448, false)).toContain('E');
    });

    it('formats MGRS grouping', () => {
      expect(formatMgrs('33UXQ0123456789')).toBe('33UXQ 01234 56789');
    });
  });

  describe('Conversions', () => {
    it('builds all coordinate outputs', () => {
      const results = buildCoordinateResults({ lat: 48.85837, lon: 2.29448 });
      expect(results.dd).toContain('48.858370');
      expect(results.dm).toContain('N');
      expect(results.dms).toContain('"');
      expect(results.mgrs.length).toBeGreaterThan(10);
    });
  });

  describe('Metadata', () => {
    it('exposes correct metadata', () => {
      expect(coordinatesConversionTool.id).toBe('coordinates-conversion');
      expect(coordinatesConversionTool.name).toBeTruthy();
    });
  });
});
