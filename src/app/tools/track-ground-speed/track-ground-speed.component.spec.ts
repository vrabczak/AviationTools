import { TrackGroundSpeedComponent, trackGroundSpeedTool } from './track-ground-speed.component';

describe('TrackGroundSpeed', () => {
  it('calculates ground track and speed', () => {
    const component = new TrackGroundSpeedComponent();
    const { groundTrack, groundSpeed } = component.calculateGroundVector(210, 125, 240, 18);
    expect(groundTrack).toBeGreaterThan(0);
    expect(groundSpeed).toBeGreaterThan(0);
  });

  it('handles calm wind', () => {
    const component = new TrackGroundSpeedComponent();
    const { groundTrack, groundSpeed } = component.calculateGroundVector(90, 100, 0, 0);
    expect(groundTrack).toBeCloseTo(90, 1);
    expect(groundSpeed).toBeCloseTo(100, 1);
  });

  it('exposes metadata', () => {
    expect(trackGroundSpeedTool.id).toBe('track-ground-speed');
    expect(trackGroundSpeedTool.name).toBeTruthy();
  });
});
