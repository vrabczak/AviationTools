export type OgeWindDirection = 'headwind' | 'crosswind' | 'tailwind';

interface OgeWindCorrectionTableRow {
  velocityMps: number;
  headwindKg: number | null;
  crosswindKg: number | null;
  tailwindKg: number | null;
}

interface OgeWindCorrectionTable {
  rows: readonly OgeWindCorrectionTableRow[];
}

/**
 * OGE wind-correction table compiled from `src/assets/OGE_Wind_Correction.csv`.
 *
 * Wind velocity is stored in meters per second and corrections in kilograms.
 */
export const OGE_WIND_CORRECTION_TABLE: OgeWindCorrectionTable = {
  rows: [
    { velocityMps: 1, headwindKg: 58, crosswindKg: -168, tailwindKg: -305 },
    { velocityMps: 2, headwindKg: 135, crosswindKg: -206, tailwindKg: -527 },
    { velocityMps: 3, headwindKg: 228, crosswindKg: -154, tailwindKg: -668 },
    { velocityMps: 4, headwindKg: 332, crosswindKg: -41, tailwindKg: -737 },
    { velocityMps: 5, headwindKg: 448, crosswindKg: 109, tailwindKg: -744 },
    { velocityMps: 6, headwindKg: 574, crosswindKg: 277, tailwindKg: -699 },
    { velocityMps: 7, headwindKg: 711, crosswindKg: 454, tailwindKg: -615 },
    { velocityMps: 8, headwindKg: 862, crosswindKg: 631, tailwindKg: -525 },
    { velocityMps: 9, headwindKg: 1029, crosswindKg: 810, tailwindKg: -410 },
    { velocityMps: 10, headwindKg: 1215, crosswindKg: 997, tailwindKg: -300 },
    { velocityMps: 11, headwindKg: 1428, crosswindKg: null, tailwindKg: null },
    { velocityMps: 12, headwindKg: 1671, crosswindKg: null, tailwindKg: null },
  ],
};
