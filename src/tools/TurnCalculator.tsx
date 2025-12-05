import { useEffect, useRef, useState } from 'react';
import { ITool } from './ITool';

export interface TurnResult {
  radiusMeters: number;
  time360Seconds: number;
}

/**
 * Calculates turn radius and time for a full 360° turn given speed and bank angle.
 *
 * @param speedKnots - True airspeed in knots.
 * @param bankAngle - Bank angle in degrees.
 * @returns Turn radius in meters and time for a complete turn in seconds.
 */
export function calculateTurn(speedKnots: number, bankAngle: number): TurnResult {
  if (bankAngle === 0 || bankAngle >= 90) {
    return { radiusMeters: Infinity, time360Seconds: Infinity };
  }

  const speedMps = speedKnots * 0.514444;
  const bankRad = (bankAngle * Math.PI) / 180;
  const radius = (speedMps * speedMps) / (9.81 * Math.tan(bankRad));
  const turnRateDegPerSec = ((9.81 * Math.tan(bankRad)) / speedMps) * (180 / Math.PI);
  const time360 = 360 / turnRateDegPerSec;

  return {
    radiusMeters: Math.round(radius),
    time360Seconds: Math.round(time360),
  };
}

/**
 * UI component that computes turn performance metrics for a selected bank angle.
 *
 * @returns Calculation form with derived metrics.
 */
function TurnCalculatorTool(): JSX.Element {
  const [speed, setSpeed] = useState('');
  const [bankAngle, setBankAngle] = useState('');
  const [result, setResult] = useState<TurnResult | null>(null);
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
    const speedValue = parseFloat(speed);
    const bankValue = parseFloat(bankAngle);

    if (Number.isNaN(speedValue) || Number.isNaN(bankValue)) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    if (speedValue <= 0) {
      alert('Speed must be greater than 0');
      return;
    }

    if (bankValue <= 0 || bankValue >= 90) {
      alert('Bank angle must be between 0 and 90 degrees');
      return;
    }

    setResult(calculateTurn(speedValue, bankValue));
  };

  const turnRateDegPerSec = result ? 360 / result.time360Seconds : null;
  const interpretation =
    turnRateDegPerSec === null
      ? ''
      : turnRateDegPerSec >= 2.9 && turnRateDegPerSec <= 3.1
        ? 'This is approximately a standard rate turn (3°/sec).'
        : turnRateDegPerSec > 3.1
          ? 'This is faster than a standard rate turn.'
          : 'This is slower than a standard rate turn.';

  return (
    <div className="tool-content">
      <h2>Turn Calculator</h2>
      <p className="tool-description">
        Calculate turn performance including turn radius and time to complete a 360° turn. Useful
        for planning holds, procedure turns, and traffic patterns.
      </p>

      <div className="input-group">
        <label htmlFor="speed">True Airspeed (kt):</label>
        <input
          type="number"
          id="speed"
          placeholder="e.g., 120"
          step="1"
          min="1"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
      </div>

      <div className="input-group">
        <label htmlFor="bank-angle">Bank Angle (°):</label>
        <input
          type="number"
          id="bank-angle"
          placeholder="e.g., 15"
          step="1"
          min="1"
          max="89"
          value={bankAngle}
          onChange={(e) => setBankAngle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
        <small>Typical: 15° (standard rate), 30° (steep), 45° (very steep)</small>
      </div>

      <button className="btn-primary" onClick={handleCalculate}>Calculate</button>

      {result && (
        <div ref={resultRef} className="result">
          <h3>Results:</h3>
          <div className="result-grid">
            <div className="result-value">
              <span className="label">Turn Radius:</span>
              <span id="turn-radius" className="value">{result.radiusMeters.toLocaleString()}</span>
              <span className="unit">m</span>
            </div>
            <div className="result-value">
              <span className="label">360° Turn Time:</span>
              <span id="turn-time" className="value">
                {(() => {
                  const minutes = Math.floor(result.time360Seconds / 60);
                  const seconds = Math.round(result.time360Seconds % 60);
                  return `${minutes}m ${seconds}s`;
                })()}
              </span>
            </div>
            <div className="result-value">
              <span className="label">Turn Rate:</span>
              <span id="turn-rate" className="value">{turnRateDegPerSec?.toFixed(2)}</span>
              <span className="unit">°/sec</span>
            </div>
          </div>
          <div className={`result-info ${turnRateDegPerSec && turnRateDegPerSec >= 2.9 && turnRateDegPerSec <= 3.1 ? 'success' : ''}`}>
            <p id="turn-interpretation">{interpretation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tool metadata used by the application registry.
 */
export const turnCalculatorTool: ITool = {
  id: 'turn-calculator',
  name: 'Turn Calculator',
  description: 'Calculate turn radius and rate based on speed and bank angle',
  Component: TurnCalculatorTool,
};
