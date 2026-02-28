/**
 * Computed fly-by turn values for a given track change.
 *
 * Distances are returned in meters and nautical miles.
 */
export interface TurnAnticipationResult {
  turnAngleDeg: number;
  turnRadiusM: number;
  leadDistanceM: number;
  leadDistanceNM: number;
}

const G = 9.80665;
const NM_TO_M = 1852;
const STRAIGHT_TRACK_CHANGE_EPS_DEG = 1e-6;
const MAX_SUPPORTED_TURN_ANGLE_DEG = 179;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function normalizeDeg360(deg: number): number {
  // Normalize into [0, 360).
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}

function smallestTurnAngleDeg(inboundTrackDeg: number, outboundTrackDeg: number): number {
  const inbound = normalizeDeg360(inboundTrackDeg);
  const outbound = normalizeDeg360(outboundTrackDeg);
  let delta = Math.abs(outbound - inbound);
  if (delta > 180) delta = 360 - delta;
  return delta;
}

/**
 * Computes fly-by lead distance before a waypoint from speed, bank, and track change.
 *
 * Assumptions:
 * - Coordinated turn with constant bank.
 * - Ground speed is representative through the turn.
 * - Flat-Earth geometric approximation.
 *
 * @param bankAngleDeg Bank angle in degrees; must be greater than 0.
 * @param groundSpeedKt Ground speed in knots; must be greater than 0.
 * @param inboundTrackDeg Inbound track to the waypoint in degrees.
 * @param outboundTrackDeg Outbound track from the waypoint in degrees.
 * @throws Error if the track change exceeds 179 degrees.
 * @returns Turn angle, turn radius, and turn lead distances.
 */
export function computeTurnAnticipationDistance(
  bankAngleDeg: number,
  groundSpeedKt: number,
  inboundTrackDeg: number,
  outboundTrackDeg: number
): TurnAnticipationResult {
  if (!Number.isFinite(bankAngleDeg) || bankAngleDeg <= 0) {
    throw new Error('bankAngleDeg must be a finite number > 0');
  }
  if (!Number.isFinite(groundSpeedKt) || groundSpeedKt <= 0) {
    throw new Error('groundSpeedKt must be a finite number > 0');
  }

  const turnAngleDeg = smallestTurnAngleDeg(inboundTrackDeg, outboundTrackDeg);

  if (turnAngleDeg > MAX_SUPPORTED_TURN_ANGLE_DEG) {
    throw new Error('Turn difference must be 179 deg or less for this model.');
  }

  // Nearly straight path: no practical lead distance.
  if (turnAngleDeg < STRAIGHT_TRACK_CHANGE_EPS_DEG) {
    return {
      turnAngleDeg,
      turnRadiusM: Infinity,
      leadDistanceM: 0,
      leadDistanceNM: 0,
    };
  }

  // Convert speed from knots to m/s.
  const speedMps = groundSpeedKt * 0.514444;
  const bankAngleRad = degToRad(bankAngleDeg);
  const tanBank = Math.tan(bankAngleRad);

  if (!Number.isFinite(tanBank) || tanBank <= 0) {
    throw new Error('Invalid bank angle (tan(phi) not finite/positive).');
  }

  const turnRadiusM = (speedMps * speedMps) / (G * tanBank);
  const turnAngleRad = degToRad(turnAngleDeg);
  const leadDistanceM = turnRadiusM * Math.tan(turnAngleRad / 2);

  return {
    turnAngleDeg,
    turnRadiusM,
    leadDistanceM,
    leadDistanceNM: leadDistanceM / NM_TO_M,
  };
}
