import { MinimaAltitudeHeightComponent, minimaAltitudeHeightTool } from './minima-altitude-height.component';

describe('MinimaAltitudeHeight', () => {
  it('uses aircraft minima when OCH is lower', () => {
    const component = new MinimaAltitudeHeightComponent();
    const result = component.calculateMinima(1500, 200, 250, 50);
    expect(result.usesAircraftMinima).toBeTrue();
    expect(result.decisionAltitude).toBeGreaterThan(1500);
  });

  it('exposes metadata', () => {
    expect(minimaAltitudeHeightTool.id).toBe('minima');
    expect(minimaAltitudeHeightTool.name).toBeTruthy();
  });
});
