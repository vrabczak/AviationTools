import { useEffect, useMemo, useRef, useState } from 'react';
import { ITool } from './ITool';

export interface AltitudeCorrectionResult {
  correctedAltitude: number;
  correction: number;
}

/**
 * Calculates ISA temperature-based altitude correction for cold/warm conditions.
 *
 * @param decisionAltitude - Decision altitude or MDA in feet.
 * @param airportAltitude - Airport elevation in feet.
 * @param temperature - Actual temperature at the airport in Celsius.
 * @returns Corrected altitude and the applied correction in feet.
 */
export function calculateTemperatureCorrection(
  decisionAltitude: number,
  airportAltitude: number,
  temperature: number
): AltitudeCorrectionResult {
  const heightAboveAirport = decisionAltitude - airportAltitude;
  const isaTemp = 15 - (airportAltitude / 1000) * 2;
  const actualTempKelvin = temperature + 273;
  const correction = (heightAboveAirport * (isaTemp - temperature)) / actualTempKelvin;
  const correctedAltitude = decisionAltitude + correction;

  return { correctedAltitude, correction };
}

/**
 * UI component that computes altitude corrections for non-ISA temperatures.
 *
 * @returns Calculation form with guidance text.
 */
function AltitudeCorrectionTool(): JSX.Element {
  const [decisionAlt, setDecisionAlt] = useState('');
  const [airportAlt, setAirportAlt] = useState('');
  const [temperature, setTemperature] = useState('');
  const [result, setResult] = useState<AltitudeCorrectionResult | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const interpretation = useMemo(() => {
    if (!result) return '';
    if (result.correction > 0) {
      return `Cold temperature! You will be LOWER than indicated altitude. Add ${Math.round(result.correction)} ft to your decision altitude to maintain safe terrain clearance.`;
    }
    if (result.correction < 0) {
      return `Warm temperature. You will be HIGHER than indicated altitude by ${Math.abs(Math.round(result.correction))} ft. Correction usually not applied for warmer temperatures.`;
    }
    return 'Temperature matches ISA. No correction needed.';
  }, [result]);

  useEffect(() => {
    if (!result || !resultRef.current) return;
    try {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      resultRef.current.scrollIntoView();
    }
  }, [result]);

  const handleCalculate = () => {
    const decisionValue = parseFloat(decisionAlt);
    const airportValue = parseFloat(airportAlt);
    const temperatureValue = parseFloat(temperature);

    if (Number.isNaN(decisionValue) || Number.isNaN(airportValue) || Number.isNaN(temperatureValue)) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    if (airportValue >= decisionValue) {
      alert('Airport elevation must be lower than DA/MDA');
      return;
    }

    setResult(calculateTemperatureCorrection(decisionValue, airportValue, temperatureValue));
  };

  return (
    <div className="tool-content">
      <h2>Altitude Correction (Temperature)</h2>
      <p className="tool-description">
        Calculate temperature-corrected altitude for approach procedures. Cold temperatures cause
        the aircraft to be lower than indicated, warm temperatures cause it to be higher. Critical
        for Decision Altitude and Minimum Descent Altitude.
      </p>

      <div className="input-group">
        <label htmlFor="decision-alt">DA / MDA (ft):</label>
        <input
          type="number"
          id="decision-alt"
          placeholder="e.g., 1700"
          step="10"
          value={decisionAlt}
          onChange={(e) => setDecisionAlt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
        <small>Altitude you want to correct (e.g., Decision Altitude, Minimum Descent Altitude)</small>
      </div>

      <div className="input-group">
        <label htmlFor="airport-alt">Airport Elevation (ft):</label>
        <input
          type="number"
          id="airport-alt"
          placeholder="e.g., 1500"
          step="10"
          value={airportAlt}
          onChange={(e) => setAirportAlt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
      </div>

      <div className="input-group">
        <label htmlFor="temperature">Airport Temperature (°C):</label>
        <input
          type="number"
          id="temperature"
          placeholder="e.g., -15"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
      </div>

      <button className="btn-primary" onClick={handleCalculate}>Calculate</button>

      {result && (
        <div ref={resultRef} className="result">
          <h3>Result:</h3>
          <div className="result-value">
            <span className="label">Corrected Altitude:</span>
            <span id="corrected-alt" className="value">{Math.round(result.correctedAltitude).toLocaleString()}</span>
            <span className="unit">ft</span>
          </div>
          <div className="result-value">
            <span className="label">Correction:</span>
            <span id="correction-value" className="value">
              {`${result.correction >= 0 ? '+' : ''}${Math.round(result.correction).toLocaleString()}`}
            </span>
            <span className="unit">ft</span>
          </div>
          <div className={`result-info ${result.correction > 0 ? 'warning' : ''}`}>
            <p id="result-interpretation">{interpretation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tool metadata used by the application registry.
 */
export const altitudeCorrectionTool: ITool = {
  id: 'altitude-correction',
  name: 'Altitude Correction',
  description: 'Calculate temperature-corrected altitude for approach procedures',
  Component: AltitudeCorrectionTool,
};
