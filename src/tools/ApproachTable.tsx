import { useEffect, useMemo, useRef, useState } from 'react';
import { ITool } from './ITool';

export interface ApproachRow {
  distanceNM: number;
  distanceKM: string;
  altitudeAbove: number;
  heightAbove: number;
}

export type AltitudeUnit = 'ft' | 'm';
export type DistanceUnit = 'NM' | 'km';

/**
 * Builds an approach reference table for 1–10 NM with target altitude and glide slope.
 *
 * @param targetAltitude - Target altitude in feet.
 * @param slopeAngle - Glide slope angle in degrees.
 * @returns Table rows containing distances and required heights.
 */
export function calculateApproachTable(targetAltitude: number, slopeAngle: number): ApproachRow[] {
  const NM_TO_FEET = 6076.12;
  const NM_TO_KM = 1.852;
  const results: ApproachRow[] = [];

  for (let distanceNM = 1; distanceNM <= 10; distanceNM++) {
    const distanceFeet = distanceNM * NM_TO_FEET;
    const distanceKM = (distanceNM * NM_TO_KM).toFixed(1);
    const slopeRadians = (slopeAngle * Math.PI) / 180;
    const heightAbove = distanceFeet * Math.tan(slopeRadians);
    const altitudeAbove = targetAltitude + heightAbove;

    results.push({
      distanceNM,
      distanceKM,
      altitudeAbove,
      heightAbove,
    });
  }

  return results;
}

const FEET_PER_METER = 3.28084;

/**
 * Formats a value in feet into the requested altitude unit.
 *
 * @param valueFt - Value in feet.
 * @param unit - Desired altitude unit.
 * @returns Rounded, localized string.
 */
function formatAltitude(valueFt: number, unit: AltitudeUnit): string {
  const converted = unit === 'm' ? valueFt / FEET_PER_METER : valueFt;
  return Math.round(converted).toLocaleString();
}

/**
 * UI component that generates an approach table for a glide slope and target altitude.
 *
 * @returns Form inputs and result table.
 */
function ApproachTableTool(): JSX.Element {
  const [targetAltitude, setTargetAltitude] = useState('');
  const [slopeAngle, setSlopeAngle] = useState('3');
  const [groundSpeed, setGroundSpeed] = useState('');
  const [altitudeUnit, setAltitudeUnit] = useState<AltitudeUnit>('ft');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('NM');
  const [rows, setRows] = useState<ApproachRow[] | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const targetAltitudeFt = useMemo(() => {
    const val = parseFloat(targetAltitude);
    if (Number.isNaN(val)) return null;
    return altitudeUnit === 'm' ? val * FEET_PER_METER : val;
  }, [altitudeUnit, targetAltitude]);

  useEffect(() => {
    if (!rows || !resultRef.current) return;
    try {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      resultRef.current.scrollIntoView();
    }
  }, [rows]);

  const handleGenerate = () => {
    const slope = parseFloat(slopeAngle);
    if (targetAltitudeFt === null) {
      alert('Please enter a valid Target Altitude');
      return;
    }
    if (Number.isNaN(slope) || slope < 0 || slope > 60) {
      alert('Please enter a valid slope angle (0-60°)');
      return;
    }
    setRows(calculateApproachTable(targetAltitudeFt, slope));
  };

  const verticalSpeedText = useMemo(() => {
    if (!rows) return null;
    const slope = parseFloat(slopeAngle);
    const gs = parseFloat(groundSpeed);
    if (Number.isNaN(slope) || Number.isNaN(gs) || gs <= 0) return null;
    const vsFtMin = gs * Math.tan((slope * Math.PI) / 180) * 101.27;
    if (altitudeUnit === 'm') {
      return `Target Vertical Speed: ${Math.round(vsFtMin / FEET_PER_METER)} m/min`;
    }
    return `Target Vertical Speed: ${Math.round(vsFtMin)} ft/min`;
  }, [altitudeUnit, groundSpeed, rows, slopeAngle]);

  return (
    <div className="tool-content">
      <h2>Approach Table</h2>
      <p className="tool-description">
        Generate a table showing distance to Target Altitude, Altitude Above and Height Above for a
        given glide slope angle. Useful for approach planning and monitoring.
      </p>

      <div className="input-group">
        <label htmlFor="target-altitude">Target Altitude:</label>
        <div className="inline-row">
          <input
            type="number"
            id="target-altitude"
            placeholder="e.g., 1500"
            step="1"
            value={targetAltitude}
            onChange={(e) => setTargetAltitude(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <select
            id="altitude-unit"
            aria-label="Altitude unit"
            value={altitudeUnit}
            onChange={(e) => setAltitudeUnit(e.target.value as AltitudeUnit)}
          >
            <option value="ft">ft</option>
            <option value="m">m</option>
          </select>
        </div>
        <small>Enter target altitude in the selected unit</small>
      </div>

      <div className="input-group">
        <label htmlFor="slope-angle">Glide Slope Angle (°):</label>
        <input
          type="number"
          id="slope-angle"
          placeholder="3"
          step="0.1"
          value={slopeAngle}
          onChange={(e) => setSlopeAngle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <small>Approach slope angle in degrees (default: 3°)</small>
      </div>

      <div className="input-group">
        <label htmlFor="ground-speed">Ground Speed (kt):</label>
        <input
          type="number"
          id="ground-speed"
          placeholder="e.g., 100"
          step="1"
          min="1"
          value={groundSpeed}
          onChange={(e) => setGroundSpeed(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <small>Ground speed in knots (optional, for vertical speed calculation)</small>
      </div>

      <div className="input-group">
        <label htmlFor="distance-unit">Distance Unit:</label>
        <select
          id="distance-unit"
          aria-label="Distance unit"
          value={distanceUnit}
          onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
        >
          <option value="NM">NM</option>
          <option value="km">km</option>
        </select>
      </div>

      <button className="btn-primary" onClick={handleGenerate}>Generate Table</button>

      {rows && (
        <div ref={resultRef} className="result">
          <h3>Approach Table:</h3>
          <div className="table-container">
            <table className="approach-table">
              <thead>
                <tr>
                  <th>Distance ({distanceUnit})</th>
                  <th>Altitude ({altitudeUnit})</th>
                  <th>Height ({altitudeUnit})</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.distanceNM}>
                    <td>{distanceUnit === 'NM' ? row.distanceNM : row.distanceKM}</td>
                    <td>{formatAltitude(row.altitudeAbove, altitudeUnit)}</td>
                    <td>{formatAltitude(row.heightAbove, altitudeUnit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="result-info">
              <p>
                Glide slope: {parseFloat(slopeAngle) || 0}° | Target Altitude:{' '}
                {targetAltitudeFt !== null
                  ? altitudeUnit === 'm'
                    ? `${Math.round(targetAltitudeFt / FEET_PER_METER).toLocaleString()} m`
                    : `${Math.round(targetAltitudeFt).toLocaleString()} ft`
                  : '-'}
              </p>
              {verticalSpeedText && <p>{verticalSpeedText}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tool metadata used by the application registry.
 */
export const approachTableTool: ITool = {
  id: 'approach-table',
  name: 'Approach Table',
  description: 'Generate approach table with distances, altitudes, and heights above Target Altitude',
  Component: ApproachTableTool,
};
