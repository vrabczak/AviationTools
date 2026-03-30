import { IGE_TABLE } from './ige-margin.data';

export type IgeAltitudeUnit = 'm' | 'ft';

const METERS_PER_FOOT = 0.3048;
const ALTITUDE_ROWS_ASC = [...IGE_TABLE.rows].reverse();
const ALTITUDES_METERS = ALTITUDE_ROWS_ASC.map((row) => row.altitudeMeters);
const MIN_ALTITUDE_METERS = ALTITUDES_METERS[0];
const MAX_ALTITUDE_METERS = ALTITUDES_METERS[ALTITUDES_METERS.length - 1];
const MIN_TEMPERATURE_C = IGE_TABLE.temperaturesC[0];
const MAX_TEMPERATURE_C = IGE_TABLE.temperaturesC[IGE_TABLE.temperaturesC.length - 1];

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

function ensureFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
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
