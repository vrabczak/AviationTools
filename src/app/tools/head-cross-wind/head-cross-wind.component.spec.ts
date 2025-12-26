import { HeadCrossWindComponent, headCrossWindTool } from './head-cross-wind.component';
import { normalizeDegrees } from '../../utils/angles';

describe('HeadCrossWind', () => {
  it('normalizes degrees into 0-360', () => {
    expect(normalizeDegrees(370)).toBeCloseTo(10);
    expect(normalizeDegrees(-10)).toBeCloseTo(350);
  });

  it('calculates wind components', () => {
    const component = new HeadCrossWindComponent();
    const result = component.calculateWindComponents(20, 180, 180);
    expect(result.headwind).toBeCloseTo(20, 2);
    expect(result.crosswind).toBeCloseTo(0, 2);
  });

  it('exposes metadata', () => {
    expect(headCrossWindTool.id).toBe('head-cross-wind');
    expect(headCrossWindTool.name).toBeTruthy();
  });
});
