import { IGE_TABLE } from './ige-margin.data';
import { IGE_WIND_CORRECTION_TABLE, IgeWindDirection } from './ige-margin.wind-correction.data';

export type IgeAltitudeUnit = 'm' | 'ft';

const METERS_PER_FOOT = 0.3048;
const ALTITUDE_ROWS_ASC = [...IGE_TABLE.rows].reverse();
const ALTITUDES_METERS = ALTITUDE_ROWS_ASC.map((row) => row.altitudeMeters);
const MIN_ALTITUDE_METERS = ALTITUDES_METERS[0];
const MAX_ALTITUDE_METERS = ALTITUDES_METERS[ALTITUDES_METERS.length - 1];
const MIN_TEMPERATURE_C = IGE_TABLE.temperaturesC[0];
const MAX_TEMPERATURE_C = IGE_TABLE.temperaturesC[IGE_TABLE.temperaturesC.length - 1];
const IGE_WIND_CORRECTION_ROWS = {
  headwind: buildIgeWindCorrectionRows('headwindKg'),
  crosswind: buildIgeWindCorrectionRows('crosswindKg'),
  tailwind: buildIgeWindCorrectionRows('tailwindKg'),
} satisfies Record<IgeWindDirection, readonly IgeWindCorrectionRow[]>;

/**
 * Converts altitude input to meters for the IGE lookup table.
 * @param altitude Altitude value entered by the user.
 * @param unit Altitude unit, either meters or feet.
 * @returns Altitude converted to meters.
 */
export function convertIgeAltitudeToMeters(altitude: number, unit: IgeAltitudeUnit): number {
  return unit === 'ft' ? altitude * METERS_PER_FOOT : altitude;
}

/**
 * Looks up the IGE limit from the bundled performance table using bilinear interpolation.
 * @param altitudeMeters Pressure altitude in meters. Supported range is 0 to 3200 m.
 * @param temperatureC Outside air temperature in degrees Celsius. Supported range is -40 to 40 C.
 * @returns Interpolated IGE gross-weight limit in kilograms.
 * @throws Error when the requested altitude or temperature is outside the table range.
 */
export function lookupIgeLimitKg(altitudeMeters: number, temperatureC: number): number {
  ensureFinite(altitudeMeters, 'Altitude');
  ensureFinite(temperatureC, 'Temperature');

  if (altitudeMeters < MIN_ALTITUDE_METERS || altitudeMeters > MAX_ALTITUDE_METERS) {
    throw new Error(`Altitude must be between ${MIN_ALTITUDE_METERS} m and ${MAX_ALTITUDE_METERS} m.`);
  }
  if (temperatureC < MIN_TEMPERATURE_C || temperatureC > MAX_TEMPERATURE_C) {
    throw new Error(`Temperature must be between ${MIN_TEMPERATURE_C} C and ${MAX_TEMPERATURE_C} C.`);
  }

  const altitudeBounds = findIgeBounds(ALTITUDES_METERS, altitudeMeters);
  const temperatureBounds = findIgeBounds(IGE_TABLE.temperaturesC, temperatureC);

  const lowerAltitudeRow = ALTITUDE_ROWS_ASC[altitudeBounds.lowerIndex];
  const upperAltitudeRow = ALTITUDE_ROWS_ASC[altitudeBounds.upperIndex];
  const lowerTemperature = IGE_TABLE.temperaturesC[temperatureBounds.lowerIndex];
  const upperTemperature = IGE_TABLE.temperaturesC[temperatureBounds.upperIndex];

  const lowerAltitudeLimit = interpolateIgeLinear(
    temperatureC,
    lowerTemperature,
    upperTemperature,
    lowerAltitudeRow.limitsKg[temperatureBounds.lowerIndex],
    lowerAltitudeRow.limitsKg[temperatureBounds.upperIndex],
  );
  const upperAltitudeLimit = interpolateIgeLinear(
    temperatureC,
    lowerTemperature,
    upperTemperature,
    upperAltitudeRow.limitsKg[temperatureBounds.lowerIndex],
    upperAltitudeRow.limitsKg[temperatureBounds.upperIndex],
  );

  return interpolateIgeLinear(
    altitudeMeters,
    lowerAltitudeRow.altitudeMeters,
    upperAltitudeRow.altitudeMeters,
    lowerAltitudeLimit,
    upperAltitudeLimit,
  );
}

/**
 * Looks up IGE wind correction using the bundled correction table.
 * @param windVelocityMps Wind velocity in meters per second.
 * @param direction Wind direction relative to the helicopter heading.
 * @returns Interpolated IGE correction in kilograms.
 * @throws Error when the requested velocity is outside the supported range for the selected direction.
 */
export function lookupIgeWindCorrectionKg(windVelocityMps: number, direction: IgeWindDirection): number {
  ensureFinite(windVelocityMps, 'Wind velocity');

  if (windVelocityMps < 0) {
    throw new Error('Wind velocity must be greater than or equal to zero.');
  }

  const rows = IGE_WIND_CORRECTION_ROWS[direction];
  const maxWindVelocityMps = rows[rows.length - 1]?.velocityMps ?? 0;

  if (windVelocityMps > maxWindVelocityMps) {
    throw new Error(`Wind velocity for ${direction} must be between 0 m/s and ${maxWindVelocityMps} m/s.`);
  }

  const bounds = findIgeBounds(
    rows.map((row) => row.velocityMps),
    windVelocityMps,
  );
  const lowerRow = rows[bounds.lowerIndex];
  const upperRow = rows[bounds.upperIndex];

  return interpolateIgeLinear(
    windVelocityMps,
    lowerRow.velocityMps,
    upperRow.velocityMps,
    lowerRow.correctionKg,
    upperRow.correctionKg,
  );
}

/**
 * Returns the maximum supported wind velocity for the selected correction direction.
 * @param direction Wind direction relative to the helicopter heading.
 * @returns Maximum supported wind velocity in meters per second.
 */
export function getIgeWindCorrectionMaxVelocityMps(direction: IgeWindDirection): number {
  const rows = IGE_WIND_CORRECTION_ROWS[direction];
  return rows[rows.length - 1]?.velocityMps ?? 0;
}

function ensureFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
}

function buildIgeWindCorrectionRows(column: 'headwindKg' | 'crosswindKg' | 'tailwindKg'): readonly IgeWindCorrectionRow[] {
  return [
    { velocityMps: 0, correctionKg: 0 },
    ...IGE_WIND_CORRECTION_TABLE.rows
      .map((row) => ({
        velocityMps: row.velocityMps,
        correctionKg: row[column],
      }))
      .filter((row): row is IgeWindCorrectionRow => row.correctionKg !== null),
  ];
}

function findIgeBounds(values: readonly number[], target: number): { lowerIndex: number; upperIndex: number } {
  const exactIndex = values.findIndex((value) => value === target);
  if (exactIndex >= 0) {
    return { lowerIndex: exactIndex, upperIndex: exactIndex };
  }

  for (let index = 0; index < values.length - 1; index += 1) {
    const current = values[index];
    const next = values[index + 1];
    if (target > current && target < next) {
      return { lowerIndex: index, upperIndex: index + 1 };
    }
  }

  throw new Error('Requested value is outside the IGE table range.');
}

function interpolateIgeLinear(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x0 === x1) {
    return y0;
  }
  return y0 + (((x - x0) * (y1 - y0)) / (x1 - x0));
}

interface IgeWindCorrectionRow {
  velocityMps: number;
  correctionKg: number;
}
