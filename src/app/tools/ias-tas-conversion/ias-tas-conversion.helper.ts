const SEA_LEVEL_PRESSURE_PA = 101325;
const SEA_LEVEL_TEMPERATURE_K = 288.15;
const TROPOSPHERE_LAPSE_RATE_K_PER_M = 0.0065;
const TROPOPAUSE_ALTITUDE_M = 11000;
const STANDARD_GRAVITY_MS2 = 9.80665;
const SPECIFIC_GAS_CONSTANT_AIR = 287.05287;
const FEET_TO_METERS = 0.3048;

const TROPOSPHERE_EXPONENT =
  STANDARD_GRAVITY_MS2 / (SPECIFIC_GAS_CONSTANT_AIR * TROPOSPHERE_LAPSE_RATE_K_PER_M);

/** Converts a flight level number, such as 100 for FL100, to pressure altitude in metres. */
export function flightLevelToMeters(flightLevel: number): number {
  return flightLevel * 100 * FEET_TO_METERS;
}

/** Returns ISA static pressure in pascals at the supplied pressure altitude. */
export function standardPressureAtFlightLevel(flightLevel: number): number {
  const altitudeMeters = flightLevelToMeters(flightLevel);

  if (altitudeMeters <= TROPOPAUSE_ALTITUDE_M) {
    const temperatureRatio =
      1 - (TROPOSPHERE_LAPSE_RATE_K_PER_M * altitudeMeters) / SEA_LEVEL_TEMPERATURE_K;

    if (temperatureRatio <= 0) {
      throw new RangeError('Flight level is outside the supported atmosphere range.');
    }

    return SEA_LEVEL_PRESSURE_PA * temperatureRatio ** TROPOSPHERE_EXPONENT;
  }

  const tropopauseTemperatureK =
    SEA_LEVEL_TEMPERATURE_K - TROPOSPHERE_LAPSE_RATE_K_PER_M * TROPOPAUSE_ALTITUDE_M;
  const tropopausePressurePa =
    SEA_LEVEL_PRESSURE_PA *
    (tropopauseTemperatureK / SEA_LEVEL_TEMPERATURE_K) ** TROPOSPHERE_EXPONENT;

  return (
    tropopausePressurePa *
    Math.exp(
      (-STANDARD_GRAVITY_MS2 * (altitudeMeters - TROPOPAUSE_ALTITUDE_M)) /
        (SPECIFIC_GAS_CONSTANT_AIR * tropopauseTemperatureK),
    )
  );
}

/**
 * Calculates TAS from IAS, flight level, and OAT using IAS ≈ EAS.
 * IAS and TAS use the same speed unit; OAT is supplied in degrees Celsius.
 */
export function calculateTas(ias: number, flightLevel: number, oatCelsius: number): number {
  const oatKelvin = oatCelsius + 273.15;
  if (oatKelvin <= 0) {
    throw new RangeError('OAT must be above absolute zero.');
  }

  const pressurePa = standardPressureAtFlightLevel(flightLevel);
  const densityRatio =
    (pressurePa / SEA_LEVEL_PRESSURE_PA) * (SEA_LEVEL_TEMPERATURE_K / oatKelvin);

  if (!Number.isFinite(densityRatio) || densityRatio <= 0) {
    throw new RangeError('Unable to determine a valid air-density ratio.');
  }

  return ias / Math.sqrt(densityRatio);
}

/** Returns the local air-density ratio sigma relative to ISA sea-level density. */
export function densityRatioAtFlightLevel(flightLevel: number, oatCelsius: number): number {
  const oatKelvin = oatCelsius + 273.15;
  if (oatKelvin <= 0) {
    throw new RangeError('OAT must be above absolute zero.');
  }

  return (
    (standardPressureAtFlightLevel(flightLevel) / SEA_LEVEL_PRESSURE_PA) *
    (SEA_LEVEL_TEMPERATURE_K / oatKelvin)
  );
}
