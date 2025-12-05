import { useEffect, useRef, useState } from 'react';
import { ITool } from './ITool';

export type CrosswindSide = 'left' | 'right' | 'none';

/**
 * Normalizes a degree measurement to the range [0, 360).
 *
 * @param value - Angle in degrees, possibly outside 0–359.
 * @returns Equivalent angle within a full circle.
 */
export function normalizeDegrees(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

/**
 * Calculates headwind/tailwind and crosswind components relative to an aircraft heading.
 *
 * @param windSpeed - Wind speed in knots.
 * @param windDirection - Direction the wind is coming from, in degrees.
 * @param aircraftHeading - Aircraft or runway heading in degrees.
 * @returns Magnitudes for headwind and crosswind plus crosswind origin side.
 */
export function calculateWindComponents(
  windSpeed: number,
  windDirection: number,
  aircraftHeading: number
): { headwind: number; crosswind: number; crosswindFrom: CrosswindSide } {
  const relativeDirectionRad = ((windDirection - aircraftHeading) * Math.PI) / 180;
  const headwind = windSpeed * Math.cos(relativeDirectionRad);
  const crosswind = windSpeed * Math.sin(relativeDirectionRad);

  let crosswindFrom: CrosswindSide = 'none';
  if (Math.abs(crosswind) >= 0.05) {
    crosswindFrom = crosswind > 0 ? 'right' : 'left';
  }

  return { headwind, crosswind, crosswindFrom };
}

/**
 * UI component for computing headwind/tailwind and crosswind values for a given heading.
 *
 * @returns Calculation form and results grid.
 */
function HeadCrossWindTool(): JSX.Element {
  const [windSpeed, setWindSpeed] = useState('');
  const [windDirection, setWindDirection] = useState('');
  const [aircraftHeading, setAircraftHeading] = useState('');
  const [result, setResult] = useState<{ headwind: number; crosswind: number; crosswindFrom: CrosswindSide } | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!result || !resultRef.current) return;
    try {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      resultRef.current.scrollIntoView();
    }
  }, [result]);

  const handleCalculate = () => {
    const speed = parseFloat(windSpeed);
    const direction = parseFloat(windDirection);
    const heading = parseFloat(aircraftHeading);

    if (Number.isNaN(speed) || Number.isNaN(direction) || Number.isNaN(heading)) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    if (speed < 0) {
      alert('Wind speed must be zero or greater');
      return;
    }

    const normalizedWindDir = normalizeDegrees(direction);
    const normalizedHeading = normalizeDegrees(heading);

    setResult(calculateWindComponents(speed, normalizedWindDir, normalizedHeading));
  };

  const headwindLabel = result ? (result.headwind >= 0 ? 'headwind' : 'tailwind') : '';
  const crosswindLabel = result ? (result.crosswindFrom === 'none' ? 'no crosswind' : `from the ${result.crosswindFrom}`) : '';

  return (
    <div className="tool-content">
      <h2>Head/Cross Wind</h2>
      <p className="tool-description">
        Calculate how much of the reported wind becomes headwind/tailwind and crosswind for your
        selected runway or course. Enter directions in degrees true or magnetic consistently with
        your aircraft heading.
      </p>

      <div className="input-group">
        <label htmlFor="wind-speed">Wind Speed (kt):</label>
        <input
          type="number"
          id="wind-speed"
          placeholder="e.g., 18"
          min="0"
          step="0.1"
          value={windSpeed}
          onChange={(e) => setWindSpeed(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
      </div>

      <div className="input-group">
        <label htmlFor="wind-direction">Wind Direction (° from):</label>
        <input
          type="number"
          id="wind-direction"
          placeholder="e.g., 210"
          min="0"
          max="360"
          step="1"
          value={windDirection}
          onChange={(e) => setWindDirection(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
        <small>Direction the wind is coming from. Use the same reference as your heading (true or magnetic).</small>
      </div>

      <div className="input-group">
        <label htmlFor="aircraft-heading">Aircraft Heading / Runway (°):</label>
        <input
          type="number"
          id="aircraft-heading"
          placeholder="e.g., 180"
          min="0"
          max="360"
          step="1"
          value={aircraftHeading}
          onChange={(e) => setAircraftHeading(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
      </div>

      <button className="btn-primary" onClick={handleCalculate}>Calculate</button>

      {result && (
        <div ref={resultRef} className="result">
          <h3>Wind Components</h3>
          <div className="result-grid">
            <div className="result-value">
              <span className="label">Headwind / Tailwind</span>
              <span id="headwind-value" className="value">
                {`${(Math.round(Math.abs(result.headwind) * 10) / 10).toFixed(1)} (${headwindLabel})`}
              </span>
              <span className="unit">kt</span>
            </div>
            <div className="result-value">
              <span className="label">Crosswind</span>
              <span id="crosswind-value" className="value">
                {`${(Math.round(Math.abs(result.crosswind) * 10) / 10).toFixed(1)} (${crosswindLabel})`}
              </span>
              <span className="unit">kt</span>
            </div>
          </div>
          <div id="wind-interpretation" className="result-info">
            <p></p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tool metadata used by the application registry.
 */
export const headCrossWindTool: ITool = {
  id: 'head-cross-wind',
  name: 'Head/Cross Wind',
  description: 'Compute headwind and crosswind components for a given runway or heading',
  Component: HeadCrossWindTool,
};
