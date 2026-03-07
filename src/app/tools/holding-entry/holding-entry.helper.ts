export type HoldingTurnDirection = 'left' | 'right';
export type HoldingEntryProcedure = 'Direct' | 'Parallel' | 'Teardrop';

/**
 * Normalizes a magnetic course to the [0, 360) range.
 *
 * @param courseDeg - Course in degrees.
 * @returns Equivalent course wrapped to [0, 360).
 */
export function normalizeCourse(courseDeg: number): number {
  const wrapped = courseDeg % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/**
 * Determines the recommended holding entry procedure from inbound hold course,
 * turn direction, and aircraft entry course to the fix.
 *
 * @param holdInboundCourseDeg - Published holding inbound course in degrees.
 * @param turnDirection - Holding pattern turn direction.
 * @param entryCourseDeg - Aircraft course to the holding fix in degrees.
 * @returns Entry procedure name.
 */
export function determineHoldingEntryProcedure(
  holdInboundCourseDeg: number,
  turnDirection: HoldingTurnDirection,
  entryCourseDeg: number
): HoldingEntryProcedure {
  const inbound = normalizeCourse(holdInboundCourseDeg);
  const outbound = normalizeCourse(inbound + 180);
  const entry = normalizeCourse(entryCourseDeg);

  let relativeFromOutbound = normalizeCourse(entry - outbound);
  if (relativeFromOutbound > 180) {
    relativeFromOutbound -= 360;
  }

  if (turnDirection === 'right') {
    if (relativeFromOutbound <= 0 && relativeFromOutbound >= -70) {
      return 'Teardrop';
    }
    if (relativeFromOutbound > 0 && relativeFromOutbound <= 110) {
      return 'Parallel';
    }
    return 'Direct';
  }

  if (relativeFromOutbound >= 0 && relativeFromOutbound <= 70) {
    return 'Teardrop';
  }
  if (relativeFromOutbound < 0 && relativeFromOutbound >= -110) {
    return 'Parallel';
  }
  return 'Direct';
}
