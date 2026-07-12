export type PressureType = 'qnh' | 'qfe';
export type PressureUnit = 'hpa' | 'inhg';
export type AltitudeUnit = 'ft' | 'm';

const FEET_TO_METERS = 0.3048;
const INHG_TO_HPA = 33.8638866667;
const SEA_LEVEL_TEMPERATURE_K = 288.15;
const TEMPERATURE_LAPSE_RATE_K_PER_M = 0.0065;
const BAROMETRIC_EXPONENT = 5.2558797;

/** Converts an airport elevation to metres for pressure calculations. */
export function altitudeToMeters(altitude: number, unit: AltitudeUnit): number {
  return unit === 'ft' ? altitude * FEET_TO_METERS : altitude;
}

/** Converts pressure between hectopascals and inches of mercury. */
export function convertPressure(value: number, from: PressureUnit, to: PressureUnit): number {
  if (from === to) return value;
  return from === 'inhg' ? value * INHG_TO_HPA : value / INHG_TO_HPA;
}

/**
 * Converts QNH to QFE, or QFE to QNH, using the ISA barometric relationship.
 * Pressure is in hPa and airport elevation is in metres above mean sea level.
 */
export function convertQnhQfe(
  pressureHpa: number,
  inputType: PressureType,
  airportElevationMeters: number,
): number {
  const temperatureRatio = 1 -
    (TEMPERATURE_LAPSE_RATE_K_PER_M * airportElevationMeters) / SEA_LEVEL_TEMPERATURE_K;

  if (temperatureRatio <= 0) {
    throw new RangeError('Airport elevation is outside the supported ISA troposphere range.');
  }

  const elevationFactor = temperatureRatio ** BAROMETRIC_EXPONENT;
  return inputType === 'qnh' ? pressureHpa * elevationFactor : pressureHpa / elevationFactor;
}
