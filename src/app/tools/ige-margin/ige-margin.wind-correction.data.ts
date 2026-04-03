export type IgeWindDirection = 'headwind' | 'crosswind' | 'tailwind';

interface IgeWindCorrectionTableRow {
  velocityMps: number;
  headwindKg: number | null;
  crosswindKg: number | null;
  tailwindKg: number | null;
}

interface IgeWindCorrectionTable {
  rows: readonly IgeWindCorrectionTableRow[];
}

/**
 * IGE wind-correction table compiled from `src/assets/IGE_Wind_Correction.csv`.
 *
 * Wind velocity is stored in meters per second and corrections in kilograms.
 */
export const IGE_WIND_CORRECTION_TABLE: IgeWindCorrectionTable = {
  rows: [
    { velocityMps: 1, headwindKg: 52, crosswindKg: -373, tailwindKg: -593 },
    { velocityMps: 2, headwindKg: 106, crosswindKg: -572, tailwindKg: -986 },
    { velocityMps: 3, headwindKg: 168, crosswindKg: -624, tailwindKg: -1212 },
    { velocityMps: 4, headwindKg: 243, crosswindKg: -564, tailwindKg: -1301 },
    { velocityMps: 5, headwindKg: 340, crosswindKg: -419, tailwindKg: -1280 },
    { velocityMps: 6, headwindKg: 461, crosswindKg: -213, tailwindKg: -1177 },
    { velocityMps: 7, headwindKg: 612, crosswindKg: 38, tailwindKg: -1020 },
    { velocityMps: 8, headwindKg: 793, crosswindKg: 322, tailwindKg: null },
    { velocityMps: 9, headwindKg: 1006, crosswindKg: 632, tailwindKg: null },
    { velocityMps: 10, headwindKg: 1251, crosswindKg: 967, tailwindKg: null },
    { velocityMps: 11, headwindKg: 1525, crosswindKg: null, tailwindKg: null },
    { velocityMps: 12, headwindKg: null, crosswindKg: null, tailwindKg: null },
  ],
};
