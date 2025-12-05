import { useEffect, useRef, useState } from 'react';
import { ITool } from './ITool';

export interface MinimaResult {
  decisionAltitude: number;
  decisionHeight: number;
  usesAircraftMinima: boolean;
  aircraftAdjustment: number;
}

/**
 * Calculates decision altitude/height by combining OCA/OCH, aircraft minima, and operator margin.
 *
 * @param oca - Obstacle Clearance Altitude in feet.
 * @param och - Obstacle Clearance Height in feet.
 * @param aircraftMinima - Aircraft-specific minima in feet.
 * @param operatorMargin - Additional operator-required margin in feet.
 * @returns Decision altitude/height and metadata on applied adjustments.
 */
export function calculateMinima(
  oca: number,
  och: number,
  aircraftMinima: number,
  operatorMargin: number
): MinimaResult {
  const usesAircraftMinima = och < aircraftMinima;
  const aircraftAdjustment = usesAircraftMinima ? aircraftMinima - och : 0;
  const decisionAltitude = oca + aircraftAdjustment + operatorMargin;
  const decisionHeight = (usesAircraftMinima ? aircraftMinima : och) + operatorMargin;

  return {
    decisionAltitude,
    decisionHeight,
    usesAircraftMinima,
    aircraftAdjustment,
  };
}

/**
 * UI component for deriving DA/MDA and DH/MDH values from published minima and operator margins.
 *
 * @returns Calculation form with summarized results.
 */
function MinimaTool(): JSX.Element {
  const [oca, setOca] = useState('');
  const [och, setOch] = useState('');
  const [aircraftMinima, setAircraftMinima] = useState('');
  const [operatorMargin, setOperatorMargin] = useState('0');
  const [result, setResult] = useState<MinimaResult | null>(null);
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
    const values = [oca, och, aircraftMinima, operatorMargin].map((v) => parseFloat(v));
    if (values.some((v) => Number.isNaN(v))) {
      alert('Please fill in all fields with valid numbers.');
      return;
    }
    if (values.some((v) => v < 0)) {
      alert('Values cannot be negative.');
      return;
    }

    const [ocaNum, ochNum, aircraftNum, marginNum] = values;
    setResult(calculateMinima(ocaNum, ochNum, aircraftNum, marginNum));
  };

  const noteText = result
    ? `${result.usesAircraftMinima
      ? `OCH is below the aircraft minima by ${Math.round(result.aircraftAdjustment)} ft. Added the difference to DA/MDA and set DH/MDH to the aircraft minima before applying the operator margin.`
      : 'Used published OCA/OCH and applied the operator margin.'} Always crosscheck with manual calculations!`
    : '';

  return (
    <div className="tool-content">
      <h2>DA/MDA DH/MDH</h2>
      <p className="tool-description">
        Calculate Decision Altitude (DA) or Minimum Descent Altitude (MDA) and Decision Height (DH) or Minimum Descent Height (MDH)
        by combining published Obstacle Clearance Altitude (OCA) and Obcstacle Clearance Height (OCH), your Aircraft Minima, and any Operator Margin.
      </p>

      <div className="input-group">
        <label htmlFor="minima-oca">OCA (ft):</label>
        <input
          type="number"
          id="minima-oca"
          placeholder="e.g., 1500"
          step="1"
          value={oca}
          onChange={(e) => setOca(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
        <small>Obstacle Clearance Altitude from the approach chart.</small>
      </div>

      <div className="input-group">
        <label htmlFor="minima-och">OCH (ft):</label>
        <input
          type="number"
          id="minima-och"
          placeholder="e.g., 200"
          step="1"
          value={och}
          onChange={(e) => setOch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
        <small>Obstacle Clearance Height from the approach chart.</small>
      </div>

      <div className="input-group">
        <label htmlFor="minima-aircraft">Aircraft Minima (ft):</label>
        <input
          type="number"
          id="minima-aircraft"
          placeholder="e.g., 200"
          step="1"
          value={aircraftMinima}
          onChange={(e) => setAircraftMinima(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
        <small>Aircraft-specific minima to compare against OCH.</small>
      </div>

      <div className="input-group">
        <label htmlFor="minima-operator">Operator Margin (ft):</label>
        <input
          type="number"
          id="minima-operator"
          placeholder="e.g., 100"
          step="1"
          value={operatorMargin}
          onChange={(e) => setOperatorMargin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
        <small>Any additional margin required by your operator (enter 0 if none).</small>
      </div>

      <button className="btn-primary" onClick={handleCalculate}>Calculate</button>

      {result && (
        <div ref={resultRef} className="result">
          <h3>Calculated Minima</h3>
          <div className="result-grid">
            <div className="result-value">
              <span className="label">DA / MDA</span>
              <span className="value" id="result-da">{Math.round(result.decisionAltitude).toLocaleString('en-US')}</span>
              <span className="unit">ft</span>
            </div>
            <div className="result-value">
              <span className="label">DH / MDH</span>
              <span className="value" id="result-dh">{Math.round(result.decisionHeight).toLocaleString('en-US')}</span>
              <span className="unit">ft</span>
            </div>
          </div>
          <div className="result-info">
            <p id="minima-note">{noteText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tool metadata used by the application registry.
 */
export const minimaAltitudeHeightTool: ITool = {
  id: 'minima',
  name: 'DA/MDA DH/MDH',
  description: 'Calculate DA/MDA and DH/MDH using OCA/OCH',
  Component: MinimaTool,
};
