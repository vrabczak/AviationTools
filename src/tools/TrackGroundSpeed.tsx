import { useEffect, useRef, useState } from 'react';
import { ITool } from './ITool';
import { normalizeDegrees } from './HeadCrossWind';

export interface GroundVector {
  groundTrack: number;
  groundSpeed: number;
}

/**
 * Calculates resulting ground track and ground speed from heading, TAS, and wind.
 *
 * @param heading - Aircraft heading in degrees (true or magnetic consistently).
 * @param tas - True airspeed in knots.
 * @param windFromDirection - Wind-from direction in degrees.
 * @param windSpeed - Wind speed in knots.
 * @returns Ground track and ground speed vector.
 */
export function calculateGroundVector(
  heading: number,
  tas: number,
  windFromDirection: number,
  windSpeed: number
): GroundVector {
  const headingRad = (heading * Math.PI) / 180;
  const windToDirection = normalizeDegrees(windFromDirection + 180);
  const windToRad = (windToDirection * Math.PI) / 180;

  const aircraftVx = tas * Math.sin(headingRad);
  const aircraftVy = tas * Math.cos(headingRad);

  const windVx = windSpeed * Math.sin(windToRad);
  const windVy = windSpeed * Math.cos(windToRad);

  const totalVx = aircraftVx + windVx;
  const totalVy = aircraftVy + windVy;

  const groundSpeed = Math.sqrt(totalVx * totalVx + totalVy * totalVy);
  const groundTrack = normalizeDegrees((Math.atan2(totalVx, totalVy) * 180) / Math.PI);

  return { groundTrack, groundSpeed };
}

/**
 * UI component that computes aircraft ground track and speed based on wind.
 *
 * @returns Calculation form with result interpretation.
 */
function TrackGroundSpeedTool(): JSX.Element {
  const [windDirection, setWindDirection] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [aircraftHeading, setAircraftHeading] = useState('');
  const [tas, setTas] = useState('');
  const [result, setResult] = useState<GroundVector | null>(null);
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
    const windDirValue = parseFloat(windDirection);
    const windSpeedValue = parseFloat(windSpeed);
    const headingValue = parseFloat(aircraftHeading);
    const tasValue = parseFloat(tas);

    if (Number.isNaN(windDirValue) || Number.isNaN(windSpeedValue) || Number.isNaN(headingValue) || Number.isNaN(tasValue)) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    if (windSpeedValue < 0 || tasValue < 0) {
      alert('Speeds must be zero or greater');
      return;
    }

    const normalizedWindDir = normalizeDegrees(windDirValue);
    const normalizedHeading = normalizeDegrees(headingValue);

    setResult(calculateGroundVector(normalizedHeading, tasValue, normalizedWindDir, windSpeedValue));
  };

  const groundTrackDisplay = result ? `${result.groundTrack.toFixed(0).padStart(3, '0')}°` : '-';
  const speedChange = result ? result.groundSpeed - parseFloat(tas || '0') : 0;
  const changeLabel =
    speedChange > 0 ? 'tailwind component increasing' : speedChange < 0 ? 'headwind component reducing' : 'little change to';

  let wcaText = '';
  if (result) {
    let wca = result.groundTrack - parseFloat(aircraftHeading || '0');
    if (wca > 180) wca -= 360;
    if (wca < -180) wca += 360;
    const wcaDirection = wca > 0 ? 'right' : wca < 0 ? 'left' : 'no';
    wcaText = wca !== 0 ? ` Wind Correction Angle: ${Math.abs(wca).toFixed(1)}° ${wcaDirection}.` : '';
  }

  return (
    <div className="tool-content">
      <h2>Track / Ground Speed</h2>
      <p className="tool-description">
        Determine your expected track and ground speed by combining true/magnetic heading, true
        airspeed, and reported wind. Use consistent references for directions (all true or all
        magnetic).
      </p>

      <div className="input-group">
        <label htmlFor="wind-direction">Wind Direction (° from):</label>
        <input
          type="number"
          id="wind-direction"
          placeholder="e.g., 240"
          min="0"
          max="360"
          step="1"
          value={windDirection}
          onChange={(e) => setWindDirection(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
        <small>Direction the wind is coming from.</small>
      </div>

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
        <label htmlFor="aircraft-heading">Aircraft Heading (°):</label>
        <input
          type="number"
          id="aircraft-heading"
          placeholder="e.g., 210"
          min="0"
          max="360"
          step="1"
          value={aircraftHeading}
          onChange={(e) => setAircraftHeading(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
      </div>

      <div className="input-group">
        <label htmlFor="aircraft-tas">Aircraft TAS (kt):</label>
        <input
          type="number"
          id="aircraft-tas"
          placeholder="e.g., 125"
          min="0"
          step="0.1"
          value={tas}
          onChange={(e) => setTas(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
      </div>

      <button className="btn-primary" onClick={handleCalculate}>Calculate</button>

      {result && (
        <div ref={resultRef} className="result">
          <h3>Results</h3>
          <div className="result-grid">
            <div className="result-value">
              <span className="label">Ground Track</span>
              <span id="ground-track" className="value">{groundTrackDisplay}</span>
              <span className="unit">°</span>
            </div>
            <div className="result-value">
              <span className="label">Ground Speed</span>
              <span id="ground-speed" className="value">{result.groundSpeed.toFixed(1)}</span>
              <span className="unit">kt</span>
            </div>
          </div>
          <div id="ground-interpretation" className="result-info">
            <p>
              Groundspeed is {Math.abs(speedChange).toFixed(1)} kt {speedChange === 0 ? 'different from' : speedChange > 0 ? 'faster than' : 'slower than'} TAS with a {changeLabel} your airspeed.{wcaText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tool metadata used by the application registry.
 */
export const trackGroundSpeedTool: ITool = {
  id: 'track-ground-speed',
  name: 'Track / Ground Speed',
  description: 'Calculate aircraft track and groundspeed from heading, TAS, and wind',
  Component: TrackGroundSpeedTool,
};
