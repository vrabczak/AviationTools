import { describe, it, expect } from 'vitest';
import { TrackGroundSpeed } from '../TrackGroundSpeed';

describe('TrackGroundSpeed', () => {
  describe('Ground vector math', () => {
    it('matches heading and TAS when no wind is present', () => {
      const tool = new TrackGroundSpeed();
      const { groundTrack, groundSpeed } = (tool as any).calculateGroundVector(90, 120, 0, 0);

      expect(groundTrack).toBeCloseTo(90, 5);
      expect(groundSpeed).toBeCloseTo(120, 5);
    });

    it('adds tailwind directly to groundspeed when aligned', () => {
      const tool = new TrackGroundSpeed();
      const { groundTrack, groundSpeed } = (tool as any).calculateGroundVector(180, 110, 0, 20);

      expect(groundTrack).toBeCloseTo(180, 3);
      expect(groundSpeed).toBeCloseTo(130, 3);
    });

    it('drifts the track with crosswind from the west', () => {
      const tool = new TrackGroundSpeed();
      const { groundTrack, groundSpeed } = (tool as any).calculateGroundVector(0, 100, 270, 30);

      expect(groundTrack).toBeCloseTo(17, 0); // drifted right of course
      expect(groundSpeed).toBeCloseTo(104.4, 1);
    });

    it('handles wind from ahead reducing speed', () => {
      const tool = new TrackGroundSpeed();
      const { groundTrack, groundSpeed } = (tool as any).calculateGroundVector(90, 100, 90, 20);

      expect(groundTrack).toBeCloseTo(90, 3);
      expect(groundSpeed).toBeCloseTo(80, 3);
    });

    it('normalizes directions', () => {
      const tool = new TrackGroundSpeed();

      expect((tool as any).normalizeDegrees(365)).toBe(5);
      expect((tool as any).normalizeDegrees(-15)).toBe(345);
    });
  });

  describe('Tool metadata', () => {
    it('exposes id, name, and description', () => {
      const tool = new TrackGroundSpeed();

      expect(tool.id).toBe('track-ground-speed');
      expect(tool.name).toBe('Track / Ground Speed');
      expect(tool.description.length).toBeGreaterThan(0);
    });

    it('renders and destroys cleanly', () => {
      const tool = new TrackGroundSpeed();
      const container = document.createElement('div');

      expect(() => tool.render(container)).not.toThrow();
      expect(() => tool.destroy()).not.toThrow();
    });
  });
});
