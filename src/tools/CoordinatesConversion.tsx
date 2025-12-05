import { useEffect, useRef, useState } from 'react';
import * as mgrs from 'mgrs';
import { ITool } from './ITool';
import { copyToClipboard } from '../utils/clipboard';

export type CoordinateFormat = 'dd' | 'dm' | 'dms' | 'mgrs';
export interface CoordinatePair { lat: number; lon: number }
export interface CoordinateResultSet {
  dd: string;
  dm: string;
  dms: string;
  mgrs: string;
}

/**
 * Verifies that latitude and longitude fall within valid geographic ranges.
 *
 * @param lat - Latitude in decimal degrees.
 * @param lon - Longitude in decimal degrees.
 * @throws If either coordinate is outside the valid range.
 */
export function validateRange(lat: number, lon: number): void {
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees.');
  }
  if (lon < -180 || lon > 180) {
    throw new Error('Longitude must be between -180 and 180 degrees.');
  }
}

/**
 * Determines the sign for a coordinate based on direction labels and provided degrees.
 *
 * @param direction - Direction letter prefix or suffix (N/S/E/W).
 * @param isLat - Whether the coordinate represents latitude.
 * @param degrees - Absolute degree value used as a fallback for sign detection.
 * @returns 1 for positive, -1 for negative coordinates.
 * @throws When an invalid direction is provided.
 */
export function getSignFromDirection(direction: string, isLat: boolean, degrees: number): number {
  const normalized = direction.toUpperCase();
  const allowed = isLat ? ['N', 'S'] : ['E', 'W'];

  if (normalized && !allowed.includes(normalized)) {
    const coordLabel = isLat ? 'latitude' : 'longitude';
    throw new Error(`Use ${allowed.join(' or ')} for ${coordLabel} directions.`);
  }

  if (normalized === 'S' || normalized === 'W') return -1;
  if (normalized === 'N' || normalized === 'E') return 1;
  return degrees < 0 ? -1 : 1;
}

/**
 * Resolves the direction letter (N/S/E/W) from a signed coordinate value.
 *
 * @param value - Latitude or longitude value.
 * @param isLat - Whether the value refers to latitude.
 * @returns Compass direction corresponding to the sign.
 */
export function getDirection(value: number, isLat: boolean): 'N' | 'S' | 'E' | 'W' {
  if (isLat) {
    return value >= 0 ? 'N' : 'S';
  }
  return value >= 0 ? 'E' : 'W';
}

/**
 * Parses a DM or DMS coordinate string into a decimal degree value.
 *
 * @param value - Raw coordinate string.
 * @param expectSeconds - Whether the string should include seconds (DMS).
 * @param isLat - Whether the coordinate is latitude.
 * @returns Decimal degrees including sign from direction letters.
 * @throws When the coordinate cannot be parsed or is incomplete.
 */
export function parseCoordinateString(value: string, expectSeconds: boolean, isLat: boolean): number {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^(N|S|E|W)?\s*(-?\d+(?:\.\d+)?)\s*°?\s*(\d+(?:\.\d+)?)\s*'?\s*(?:(\d+(?:\.\d+)?)\s*"?)?\s*(N|S|E|W)?$/);

  if (!match) {
    const formatLabel = expectSeconds ? 'DMS' : 'DM';
    throw new Error(`Could not parse ${formatLabel} value: "${value}"`);
  }

  const [, prefixDir, degreesStr, minutesStr, secondsStr, suffixDir] = match;
  const degrees = parseFloat(degreesStr);
  const minutes = parseFloat(minutesStr);
  const seconds = secondsStr ? parseFloat(secondsStr) : 0;

  if (Number.isNaN(degrees) || Number.isNaN(minutes) || (expectSeconds && Number.isNaN(seconds))) {
    throw new Error('Degrees, minutes, or seconds are invalid numbers.');
  }

  if (minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
    throw new Error('Minutes and seconds must be between 0 and 59.');
  }

  if (expectSeconds && secondsStr === undefined) {
    throw new Error('Please include seconds for DMS coordinates.');
  }

  const direction = prefixDir || suffixDir || '';

  if (expectSeconds && !direction) {
    const coordLabel = isLat ? 'latitude' : 'longitude';
    throw new Error(`Please include N/S or E/W for the ${coordLabel} DMS value.`);
  }

  const sign = getSignFromDirection(direction, isLat, degrees);
  return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
}

/**
 * Parses latitude and longitude strings expressed in decimal degrees.
 *
 * @param latStr - Latitude string input.
 * @param lonStr - Longitude string input.
 * @returns Parsed coordinate pair after validation.
 * @throws When inputs are non-numeric or out of range.
 */
export function parseDecimalDegrees(latStr: string, lonStr: string): CoordinatePair {
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error('Please provide numeric latitude and longitude values.');
  }

  validateRange(lat, lon);
  return { lat, lon };
}

/**
 * Parses coordinate strings expressed in DM or DMS format.
 *
 * @param latStr - Latitude string with direction.
 * @param lonStr - Longitude string with direction.
 * @param expectSeconds - When true, seconds are required (DMS).
 * @returns Parsed coordinate pair after validation.
 */
export function parseDegreesMinutes(latStr: string, lonStr: string, expectSeconds: boolean): CoordinatePair {
  const lat = parseCoordinateString(latStr, expectSeconds, true);
  const lon = parseCoordinateString(lonStr, expectSeconds, false);
  validateRange(lat, lon);
  return { lat, lon };
}

/**
 * Parses an MGRS coordinate string into latitude and longitude.
 *
 * @param value - MGRS string in 5-digit precision.
 * @returns Parsed coordinate pair after validation.
 * @throws When the MGRS value is empty or invalid.
 */
export function parseMgrs(value: string): CoordinatePair {
  const mgrsValue = value.trim();
  if (!mgrsValue) {
    throw new Error('Please enter an MGRS coordinate.');
  }

  const cleaned = mgrsValue.replace(/\s+/g, '');

  try {
    const [lon, lat] = mgrs.toPoint(cleaned.toUpperCase());
    validateRange(lat, lon);
    return { lat, lon };
  } catch {
    throw new Error('Invalid MGRS coordinate. Please check the grid zone and digits.');
  }
}

/**
 * Formats a decimal degree coordinate into degrees and decimal minutes.
 *
 * @param value - Coordinate value.
 * @param isLat - Whether the coordinate is latitude.
 * @returns String formatted as D M.MMM with direction letter.
 */
export function formatDegreesMinutes(value: number, isLat: boolean): string {
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutes = (abs - degrees) * 60;
  const direction = getDirection(value, isLat);
  return `${degrees}°${minutes.toFixed(3)}'${direction}`;
}

/**
 * Formats a decimal degree coordinate into degrees, minutes, and seconds.
 *
 * @param value - Coordinate value.
 * @param isLat - Whether the coordinate is latitude.
 * @returns String formatted as D M S.S with direction letter.
 */
export function formatDms(value: number, isLat: boolean): string {
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const totalMinutes = (abs - degrees) * 60;
  const minutes = Math.floor(totalMinutes);
  const seconds = (totalMinutes - minutes) * 60;
  const direction = getDirection(value, isLat);
  return `${degrees}°${minutes}'${seconds.toFixed(1)}"${direction}`;
}

/**
 * Adds whitespace separators to an MGRS string for readability.
 *
 * @param mgrsString - Raw MGRS output.
 * @returns Formatted string with grouped easting and northing values.
 */
export function formatMgrs(mgrsString: string): string {
  const match = mgrsString.match(/^([A-Z\d]+[A-Z])([\d]+)$/);
  if (!match) {
    return mgrsString;
  }

  const [, gridPart, digits] = match;
  const halfLength = digits.length / 2;
  const easting = digits.slice(0, halfLength);
  const northing = digits.slice(halfLength);

  return `${gridPart} ${easting} ${northing}`;
}

/**
 * Builds coordinate string representations for multiple formats from a parsed pair.
 *
 * @param pair - Latitude/longitude pair in decimal degrees.
 * @returns Object containing DD, DM, DMS, and MGRS strings.
 */
export function buildCoordinateResults(pair: CoordinatePair): CoordinateResultSet {
  const dd = `${pair.lat.toFixed(6)}, ${pair.lon.toFixed(6)}`;
  const dm = `${formatDegreesMinutes(pair.lat, true)}, ${formatDegreesMinutes(pair.lon, false)}`;
  const dms = `${formatDms(pair.lat, true)}, ${formatDms(pair.lon, false)}`;
  const mgrsRaw = mgrs.forward([pair.lon, pair.lat], 5);
  const mgrsFormatted = formatMgrs(mgrsRaw);

  return { dd, dm, dms, mgrs: mgrsFormatted };
}

/**
 * UI component for converting coordinates between DD, DM, DMS, and MGRS formats.
 *
 * @returns Conversion form with copyable results.
 */
function CoordinatesConversionTool(): JSX.Element {
  const [format, setFormat] = useState<CoordinateFormat>('dd');
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [mgrsInput, setMgrsInput] = useState('');
  const [results, setResults] = useState<CoordinateResultSet | null>(null);
  const [copiedField, setCopiedField] = useState<keyof CoordinateResultSet | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!results || !resultRef.current) return;
    try {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      resultRef.current.scrollIntoView();
    }
  }, [results]);

  const handleConvert = () => {
    try {
      let pair: CoordinatePair;
      switch (format) {
        case 'dd':
          pair = parseDecimalDegrees(latInput, lonInput);
          break;
        case 'dm':
          pair = parseDegreesMinutes(latInput, lonInput, false);
          break;
        case 'dms':
          pair = parseDegreesMinutes(latInput, lonInput, true);
          break;
        case 'mgrs':
          pair = parseMgrs(mgrsInput);
          break;
        default:
          throw new Error('Unsupported format selected.');
      }
      setResults(buildCoordinateResults(pair));
      setCopiedField(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert coordinates. Please check your input.';
      alert(message);
    }
  };

  const handleCopy = async (field: keyof CoordinateResultSet) => {
    if (!results) return;
    const success = await copyToClipboard(results[field]);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } else {
      alert('Unable to copy to clipboard.');
    }
  };

  const placeholders: Record<CoordinateFormat, { lat: string; lon: string; helper: string }> = {
    dd: {
      lat: '50.0952147',
      lon: '14.4360100',
      helper: 'Enter latitude and longitude in decimal degrees. North/East positive, South/West negative.',
    },
    dm: {
      lat: "50° 5.712' N",
      lon: "14° 26.160' E",
      helper: 'Enter degrees and decimal minutes with hemisphere (e.g., 50° 5.712\' N).',
    },
    dms: {
      lat: '50° 5\' 42.8" N',
      lon: '14° 26\' 9.6" E',
      helper: 'Enter degrees, minutes, seconds with hemisphere (e.g., 50° 5\' 42.8" N).',
    },
    mgrs: { lat: '', lon: '', helper: '' },
  };

  const renderInputs = () => {
    if (format === 'mgrs') {
      return (
        <div className="input-group">
          <label htmlFor="mgrs-input">MGRS Coordinate</label>
          <input
            type="text"
            id="mgrs-input"
            placeholder="33UVR59664936"
            value={mgrsInput}
            onChange={(e) => setMgrsInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
          />
          <small>Enter a 5-digit precision MGRS coordinate (e.g., 33UVR59664936).</small>
        </div>
      );
    }

    const { lat, lon, helper } = placeholders[format];
    return (
      <>
        <div className="input-group">
          <label htmlFor="lat-input">Latitude</label>
          <input
            type="text"
            id="lat-input"
            placeholder={lat}
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
          />
        </div>
        <div className="input-group">
          <label htmlFor="lon-input">Longitude</label>
          <input
            type="text"
            id="lon-input"
            placeholder={lon}
            value={lonInput}
            onChange={(e) => setLonInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
          />
          <small>{helper}</small>
        </div>
      </>
    );
  };

  return (
    <div className="tool-content">
      <h2>Coordinates Conversion</h2>
      <p className="tool-description">
        Convert between Decimal Degrees (DD), Degrees + Decimal Minutes (DM), Degrees + Minutes + Seconds (DMS) and
        5-digit Military Grid Reference System (MGRS).
      </p>

      <div className="input-group">
        <label htmlFor="coordinate-format">Input format</label>
        <select id="coordinate-format" value={format} onChange={(e) => setFormat(e.target.value as CoordinateFormat)}>
          <option value="dd">Decimal Degrees (DD)</option>
          <option value="dm">Degrees + Decimal Minutes (DM)</option>
          <option value="dms">Degrees + Minutes + Seconds (DMS)</option>
          <option value="mgrs">MGRS (5-digit)</option>
        </select>
      </div>

      {renderInputs()}

      <button className="btn-primary" onClick={handleConvert}>Convert</button>

      {results && (
        <div ref={resultRef} className="result">
          <h3>Converted Coordinates</h3>
          <div className="result-grid">
            <div className="result-value">
              <div className="label">Decimal Degrees (DD)</div>
              <div className="value" id="result-dd">{results.dd}</div>
              <button className="btn-secondary copy-btn" onClick={() => handleCopy('dd')}>
                {copiedField === 'dd' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="result-value">
              <div className="label">Degrees + Decimal Minutes (DM)</div>
              <div className="value" id="result-dm">{results.dm}</div>
              <button className="btn-secondary copy-btn" onClick={() => handleCopy('dm')}>
                {copiedField === 'dm' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="result-value">
              <div className="label">Degrees + Minutes + Seconds (DMS)</div>
              <div className="value" id="result-dms">{results.dms}</div>
              <button className="btn-secondary copy-btn" onClick={() => handleCopy('dms')}>
                {copiedField === 'dms' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="result-value">
              <div className="label">MGRS (5-digit)</div>
              <div className="value" id="result-mgrs">{results.mgrs}</div>
              <button className="btn-secondary copy-btn" onClick={() => handleCopy('mgrs')}>
                {copiedField === 'mgrs' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="result-info">
            <p>Copy any format to quickly share coordinates across devices or systems.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tool metadata used by the application registry.
 */
export const coordinatesConversionTool: ITool = {
  id: 'coordinates-conversion',
  name: 'Coordinates Conversion',
  description: 'Convert between DD, DM, DMS, and 5-digit MGRS coordinates',
  Component: CoordinatesConversionTool,
};
