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

  describe('Wind Correction Angle (WCA)', () => {
    it('calculates zero WCA when no wind', () => {
      const tool = new TrackGroundSpeed();
      const { groundTrack } = (tool as any).calculateGroundVector(90, 120, 0, 0);
      const heading = 90;
      
      let wca = groundTrack - heading;
      if (wca > 180) wca -= 360;
      if (wca < -180) wca += 360;
      
      expect(wca).toBeCloseTo(0, 5);
    });

    it('calculates positive WCA when wind drifts aircraft right', () => {
      const tool = new TrackGroundSpeed();
      // Heading north (0°), crosswind from west (270°)
      const { groundTrack } = (tool as any).calculateGroundVector(0, 100, 270, 30);
      const heading = 0;
      
      let wca = groundTrack - heading;
      if (wca > 180) wca -= 360;
      if (wca < -180) wca += 360;
      
      expect(wca).toBeGreaterThan(0); // Drifted right
      expect(wca).toBeCloseTo(17, 0);
    });

    it('calculates negative WCA when wind drifts aircraft left', () => {
      const tool = new TrackGroundSpeed();
      // Heading north (0°), crosswind from east (90°)
      const { groundTrack } = (tool as any).calculateGroundVector(0, 100, 90, 30);
      const heading = 0;
      
      let wca = groundTrack - heading;
      if (wca > 180) wca -= 360;
      if (wca < -180) wca += 360;
      
      expect(wca).toBeLessThan(0); // Drifted left
      expect(wca).toBeCloseTo(-17, 0);
    });

    it('normalizes WCA when crossing 0/360° boundary (heading 350°, track 10°)', () => {
      const tool = new TrackGroundSpeed();
      // Simulate crosswind that drifts from 350° to ~10°
      const { groundTrack } = (tool as any).calculateGroundVector(350, 100, 270, 30);
      const heading = 350;
      
      let wca = groundTrack - heading;
      if (wca > 180) wca -= 360;
      if (wca < -180) wca += 360;
      
      // Should be positive and small (~17°), not ~-343°
      expect(wca).toBeGreaterThan(0);
      expect(wca).toBeLessThan(30);
      expect(wca).toBeCloseTo(17, 0);
    });

    it('normalizes WCA when crossing 360/0° boundary (heading 10°, track 350°)', () => {
      const tool = new TrackGroundSpeed();
      // Simulate crosswind that drifts from 10° to ~350°
      const { groundTrack } = (tool as any).calculateGroundVector(10, 100, 90, 30);
      const heading = 10;
      
      let wca = groundTrack - heading;
      if (wca > 180) wca -= 360;
      if (wca < -180) wca += 360;
      
      // Should be negative and small (~-17°), not ~+343°
      expect(wca).toBeLessThan(0);
      expect(wca).toBeGreaterThan(-30);
      expect(wca).toBeCloseTo(-17, 0);
    });

    it('handles large drift crossing 180° boundary correctly', () => {
      // Strong crosswind scenario - testing normalization logic
      const heading = 180;
      const groundTrack = 10; // Extreme drift
      
      let wca = groundTrack - heading;
      if (wca > 180) wca -= 360;
      if (wca < -180) wca += 360;
      
      // Should be -170°, not +190°
      expect(wca).toBeCloseTo(-170, 0);
      expect(wca).toBeGreaterThan(-180);
      expect(wca).toBeLessThan(0);
    });

    it('calculates WCA correctly for diagonal wind (NE heading, SE wind)', () => {
      const tool = new TrackGroundSpeed();
      // Heading northeast (45°), wind from southeast (135°)
      const { groundTrack } = (tool as any).calculateGroundVector(45, 120, 135, 25);
      const heading = 45;
      
      let wca = groundTrack - heading;
      if (wca > 180) wca -= 360;
      if (wca < -180) wca += 360;
      
      // Wind from right rear quarter should drift left slightly
      expect(wca).toBeLessThan(0);
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
