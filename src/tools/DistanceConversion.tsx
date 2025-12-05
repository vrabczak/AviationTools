import { useEffect, useRef, useState } from 'react';
import { ITool } from './ITool';
import { copyToClipboard } from '../utils/clipboard';

export type DistanceUnit = 'm' | 'km' | 'nm' | 'ft' | 'sm';

const TO_M: Record<DistanceUnit, number> = {
  m: 1,
  km: 1000,
  nm: 1852,
  ft: 0.3048,
  sm: 1609.344,
};

const FROM_M: Record<DistanceUnit, number> = {
  m: 1,
  km: 1 / 1000,
  nm: 1 / 1852,
  ft: 1 / 0.3048,
  sm: 1 / 1609.344,
};

/**
 * Converts a distance from one unit to another.
 *
 * @param value - Input distance value.
 * @param fromUnit - Unit of the provided value.
 * @param toUnit - Desired output unit.
 * @returns Converted distance.
 */
export function convertDistance(value: number, fromUnit: DistanceUnit, toUnit: DistanceUnit): number {
  const meters = value * TO_M[fromUnit];
  return meters * FROM_M[toUnit];
}

/**
 * Formats a distance with adaptive precision for readability.
 *
 * @param value - Numeric distance to format.
 * @returns Formatted distance string.
 */
function formatDistance(value: number): string {
  if (value >= 1000) return value.toFixed(1);
  if (value >= 100) return value.toFixed(2);
  if (value >= 10) return value.toFixed(3);
  return value.toFixed(4);
}

/**
 * UI component for converting distances between aviation-relevant units.
 *
 * @returns Conversion form with copyable outputs.
 */
function DistanceConversionTool(): JSX.Element {
  const [unit, setUnit] = useState<DistanceUnit>('m');
  const [value, setValue] = useState('');
  const [results, setResults] = useState<Record<DistanceUnit, string> | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!results || !resultRef.current) return;
    try {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      resultRef.current.scrollIntoView();
    }
  }, [results]);

  const handleConversion = () => {
    try {
      const numericValue = parseFloat(value);
      if (Number.isNaN(numericValue)) {
        throw new Error('Please enter a valid numeric distance value.');
      }
      if (numericValue < 0) {
        throw new Error('Distance value must be positive.');
      }

      const converted: Record<DistanceUnit, string> = {
        m: `${formatDistance(convertDistance(numericValue, unit, 'm'))} m`,
        km: `${formatDistance(convertDistance(numericValue, unit, 'km'))} km`,
        nm: `${formatDistance(convertDistance(numericValue, unit, 'nm'))} NM`,
        ft: `${formatDistance(convertDistance(numericValue, unit, 'ft'))} ft`,
        sm: `${formatDistance(convertDistance(numericValue, unit, 'sm'))} SM`,
      };

      setResults(converted);
      setCopiedField(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert distance. Please check your input.';
      alert(message);
    }
  };

  const handleCopy = async (field: DistanceUnit) => {
    if (!results) return;
    const success = await copyToClipboard(results[field]);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } else {
      alert('Unable to copy to clipboard.');
    }
  };

  const units: DistanceUnit[] = ['m', 'km', 'nm', 'ft', 'sm'];
  const visibleUnits = units.filter((u) => u !== unit);

  return (
    <div className="tool-content">
      <h2>Distance Conversion</h2>
      <p className="tool-description">
        Convert between Meters (m), Kilometers (km), Nautical Miles (NM), Feet (ft), and Statute Miles (SM).
      </p>

      <div className="input-group">
        <label htmlFor="distance-unit">Input unit</label>
        <select id="distance-unit" value={unit} onChange={(e) => setUnit(e.target.value as DistanceUnit)}>
          <option value="m">Meters (m)</option>
          <option value="km">Kilometers (km)</option>
          <option value="nm">Nautical Miles (NM)</option>
          <option value="ft">Feet (ft)</option>
          <option value="sm">Statute Miles (SM)</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="distance-input">Distance value</label>
        <input
          type="number"
          id="distance-input"
          placeholder="100"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConversion()}
        />
        <small>Enter a positive numeric distance value.</small>
      </div>

      <button className="btn-primary" onClick={handleConversion}>Convert</button>

      {results && (
        <div ref={resultRef} className="result">
          <h3>Converted Distances</h3>
          <div className="result-grid">
            {visibleUnits.map((targetUnit) => (
              <div key={targetUnit} className="result-value" id={`result-row-${targetUnit}`}>
                <div className="label">
                  {targetUnit === 'm' && 'Meters (m)'}
                  {targetUnit === 'km' && 'Kilometers (km)'}
                  {targetUnit === 'nm' && 'Nautical Miles (NM)'}
                  {targetUnit === 'ft' && 'Feet (ft)'}
                  {targetUnit === 'sm' && 'Statute Miles (SM)'}
                </div>
                <div className="value" id={`result-${targetUnit}`}>{results[targetUnit]}</div>
                <button className="btn-secondary copy-btn" onClick={() => handleCopy(targetUnit)}>
                  {copiedField === targetUnit ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
          <div className="result-info">
            <p>Copy any format to quickly share distance values across devices or systems.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tool metadata used by the application registry.
 */
export const distanceConversionTool: ITool = {
  id: 'distance-conversion',
  name: 'Distance Conversion',
  description: 'Convert between m, km, NM, ft, and SM',
  Component: DistanceConversionTool,
};
