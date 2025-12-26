/**
 * Normalizes an angle to the [0, 360) range.
 *
 * @param value - Angle in degrees.
 * @returns Normalized angle in degrees.
 */
export function normalizeDegrees(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}
