import { OGE_TABLE } from './oge-margin.data';

export type OgeAltitudeUnit = 'm' | 'ft';

const METERS_PER_FOOT = 0.3048;
const ALTITUDE_ROWS_ASC = [...OGE_TABLE.rows].reverse();
const ALTITUDES_METERS = ALTITUDE_ROWS_ASC.map((row) => row.altitudeMeters);
const MIN_ALTITUDE_METERS = ALTITUDES_METERS[0];
const MAX_ALTITUDE_METERS = ALTITUDES_METERS[ALTITUDES_METERS.length - 1];
const MIN_TEMPERATURE_C = OGE_TABLE.temperaturesC[0];
const MAX_TEMPERATURE_C = OGE_TABLE.temperaturesC[OGE_TABLE.temperaturesC.length - 1];

/**
 * Converts altitude input to meters for the OGE lookup table.
 * @param altitude Altitude value entered by the user.
 * @param unit Altitude unit, either meters or feet.
 * @returns Altitude converted to meters.
 */
export function convertAltitudeToMeters(altitude: number, unit: OgeAltitudeUnit): number {
  return unit === 'ft' ? altitude * METERS_PER_FOOT : altitude;
}

/**
 * Looks up the OGE limit from the bundled performance table using bilinear interpolation.
 * @param altitudeMeters Pressure altitude in meters. Supported range is 0 to 3200 m.
 * @param temperatureC Outside air temperature in degrees Celsius. Supported range is -40 to 40 C.
 * @returns Interpolated OGE gross-weight limit in kilograms.
 * @throws Error when the requested altitude or temperature is outside the table range.
 */
export function lookupOgeLimitKg(altitudeMeters: number, temperatureC: number): number {
  validateFinite(altitudeMeters, 'Altitude');
  validateFinite(temperatureC, 'Temperature');

  if (altitudeMeters < MIN_ALTITUDE_METERS || altitudeMeters > MAX_ALTITUDE_METERS) {
    throw new Error(`Altitude must be between ${MIN_ALTITUDE_METERS} m and ${MAX_ALTITUDE_METERS} m.`);
  }
  if (temperatureC < MIN_TEMPERATURE_C || temperatureC > MAX_TEMPERATURE_C) {
    throw new Error(`Temperature must be between ${MIN_TEMPERATURE_C} C and ${MAX_TEMPERATURE_C} C.`);
  }

  const altitudeBounds = findBounds(ALTITUDES_METERS, altitudeMeters);
  const temperatureBounds = findBounds(OGE_TABLE.temperaturesC, temperatureC);

  const lowerAltitudeRow = ALTITUDE_ROWS_ASC[altitudeBounds.lowerIndex];
  const upperAltitudeRow = ALTITUDE_ROWS_ASC[altitudeBounds.upperIndex];
  const lowerTemperature = OGE_TABLE.temperaturesC[temperatureBounds.lowerIndex];
  const upperTemperature = OGE_TABLE.temperaturesC[temperatureBounds.upperIndex];

  const lowerAltitudeLimit = interpolateLinear(
    temperatureC,
    lowerTemperature,
    upperTemperature,
    lowerAltitudeRow.limitsKg[temperatureBounds.lowerIndex],
    lowerAltitudeRow.limitsKg[temperatureBounds.upperIndex],
  );
  const upperAltitudeLimit = interpolateLinear(
    temperatureC,
    lowerTemperature,
    upperTemperature,
    upperAltitudeRow.limitsKg[temperatureBounds.lowerIndex],
    upperAltitudeRow.limitsKg[temperatureBounds.upperIndex],
  );

  return interpolateLinear(
    altitudeMeters,
    lowerAltitudeRow.altitudeMeters,
    upperAltitudeRow.altitudeMeters,
    lowerAltitudeLimit,
    upperAltitudeLimit,
  );
}

function validateFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
}

function findBounds(values: readonly number[], target: number): { lowerIndex: number; upperIndex: number } {
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

  throw new Error('Requested value is outside the OGE table range.');
}

function interpolateLinear(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x0 === x1) {
    return y0;
  }
  return y0 + (((x - x0) * (y1 - y0)) / (x1 - x0));
}
