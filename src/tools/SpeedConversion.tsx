import { useEffect, useRef, useState } from 'react';
import { ITool } from './ITool';
import { copyToClipboard } from '../utils/clipboard';

export type SpeedUnit = 'kt' | 'kmh' | 'ms' | 'ftmin';

const TO_MS: Record<SpeedUnit, number> = {
  kt: 0.514444,
  kmh: 1 / 3.6,
  ms: 1,
  ftmin: 0.00508,
};

const FROM_MS: Record<SpeedUnit, number> = {
  kt: 1 / 0.514444,
  kmh: 3.6,
  ms: 1,
  ftmin: 1 / 0.00508,
};

/**
 * Converts a speed between supported units using meters per second as an intermediary.
 *
 * @param value - Input speed value.
 * @param fromUnit - Unit of the provided value.
 * @param toUnit - Desired output unit.
 * @returns Converted speed.
 */
export function convertSpeed(value: number, fromUnit: SpeedUnit, toUnit: SpeedUnit): number {
  const ms = value * TO_MS[fromUnit];
  return ms * FROM_MS[toUnit];
}

/**
 * Formats a speed value with adaptive precision for readability.
 *
 * @param value - Numeric speed.
 * @returns Formatted speed string.
 */
function formatSpeed(value: number): string {
  if (value >= 1000) return value.toFixed(1);
  if (value >= 100) return value.toFixed(2);
  if (value >= 10) return value.toFixed(3);
  return value.toFixed(4);
}

/**
 * UI component for converting speeds between knots, km/h, m/s, and ft/min.
 *
 * @returns Conversion form with copyable results.
 */
function SpeedConversionTool(): JSX.Element {
  const [unit, setUnit] = useState<SpeedUnit>('kt');
  const [value, setValue] = useState('');
  const [results, setResults] = useState<Record<SpeedUnit, string> | null>(null);
  const [copiedField, setCopiedField] = useState<SpeedUnit | null>(null);
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
        throw new Error('Please enter a valid numeric speed value.');
      }
      if (numericValue < 0) {
        throw new Error('Speed value must be positive.');
      }

      const converted: Record<SpeedUnit, string> = {
        kt: `${formatSpeed(convertSpeed(numericValue, unit, 'kt'))} kt`,
        kmh: `${formatSpeed(convertSpeed(numericValue, unit, 'kmh'))} km/h`,
        ms: `${formatSpeed(convertSpeed(numericValue, unit, 'ms'))} m/s`,
        ftmin: `${formatSpeed(convertSpeed(numericValue, unit, 'ftmin'))} ft/min`,
      };

      setResults(converted);
      setCopiedField(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert speed. Please check your input.';
      alert(message);
    }
  };

  const handleCopy = async (field: SpeedUnit) => {
    if (!results) return;
    const success = await copyToClipboard(results[field]);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } else {
      alert('Unable to copy to clipboard.');
    }
  };

  const units: SpeedUnit[] = ['kt', 'kmh', 'ms', 'ftmin'];
  const visibleUnits = units.filter((u) => u !== unit);

  return (
    <div className="tool-content">
      <h2>Speed Conversion</h2>
      <p className="tool-description">
        Convert between Knots (kt), Kilometers per hour (km/h), Meters per second (m/s), and Feet per minute (ft/min).
      </p>

      <div className="input-group">
        <label htmlFor="speed-unit">Input unit</label>
        <select id="speed-unit" value={unit} onChange={(e) => setUnit(e.target.value as SpeedUnit)}>
          <option value="kt">Knots (kt)</option>
          <option value="kmh">Kilometers per hour (km/h)</option>
          <option value="ms">Meters per second (m/s)</option>
          <option value="ftmin">Feet per minute (ft/min)</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="speed-input">Speed value</label>
        <input
          type="number"
          id="speed-input"
          placeholder="100"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConversion()}
        />
        <small>Enter a positive numeric speed value.</small>
      </div>

      <button className="btn-primary" onClick={handleConversion}>Convert</button>

      {results && (
        <div ref={resultRef} className="result">
          <h3>Converted Speeds</h3>
          <div className="result-grid">
            {visibleUnits.map((targetUnit) => (
              <div key={targetUnit} className="result-value" id={`result-row-${targetUnit}`}>
                <div className="label">
                  {targetUnit === 'kt' && 'Knots (kt)'}
                  {targetUnit === 'kmh' && 'Kilometers per hour (km/h)'}
                  {targetUnit === 'ms' && 'Meters per second (m/s)'}
                  {targetUnit === 'ftmin' && 'Feet per minute (ft/min)'}
                </div>
                <div className="value" id={`result-${targetUnit}`}>{results[targetUnit]}</div>
                <button className="btn-secondary copy-btn" onClick={() => handleCopy(targetUnit)}>
                  {copiedField === targetUnit ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
          <div className="result-info">
            <p>Copy any format to quickly share speed values across devices or systems.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tool metadata used by the application registry.
 */
export const speedConversionTool: ITool = {
  id: 'speed-conversion',
  name: 'Speed Conversion',
  description: 'Convert between kt, km/h, m/s, and ft/min',
  Component: SpeedConversionTool,
};
