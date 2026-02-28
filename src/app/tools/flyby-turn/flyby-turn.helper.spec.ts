import { computeTurnAnticipationDistance } from './flyby-turn.helper';

describe('computeTurnAnticipationDistance', () => {
  it('returns finite values for a typical turn', () => {
    const result = computeTurnAnticipationDistance(25, 180, 90, 135);

    expect(result.turnAngleDeg).toBeCloseTo(45, 6);
    expect(result.turnRadiusM).toBeGreaterThan(0);
    expect(result.leadDistanceM).toBeGreaterThan(0);
    expect(result.leadDistanceNM).toBeGreaterThan(0);
  });

  it('returns zero lead for no track change', () => {
    const result = computeTurnAnticipationDistance(25, 160, 180, 180);

    expect(result.turnAngleDeg).toBe(0);
    expect(result.leadDistanceM).toBe(0);
    expect(result.leadDistanceNM).toBe(0);
    expect(result.turnRadiusM).toBe(Infinity);
  });

  it('rejects turn differences greater than 179 deg', () => {
    expect(() => computeTurnAnticipationDistance(25, 160, 90, 270))
      .toThrowError('Turn difference must be 179 deg or less for this model.');
  });

  it('throws for invalid speed or bank values', () => {
    expect(() => computeTurnAnticipationDistance(0, 160, 180, 210))
      .toThrowError('bankAngleDeg must be a finite number > 0');
    expect(() => computeTurnAnticipationDistance(25, 0, 180, 210))
      .toThrowError('groundSpeedKt must be a finite number > 0');
  });
});
