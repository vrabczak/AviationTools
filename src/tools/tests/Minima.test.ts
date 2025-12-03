import { describe, it, expect, vi } from 'vitest';
import { MinimaAltitudeHeight } from '../MinimaAltitudeHeight';

const getNumericValue = (text: string | undefined | null): number =>
  Number.parseInt((text ?? '').replace(/,/g, ''), 10);

const renderTool = () => {
  const tool = new MinimaAltitudeHeight();
  const container = document.createElement('div');
  tool.render(container);
  return { tool, container };
};

describe('Minima', () => {
  it('has correct metadata', () => {
    const tool = new MinimaAltitudeHeight();

    expect(tool.id).toBe('minima');
    expect(tool.name).toBe('DA/MDA DH/MDH');
    expect(tool.description.length).toBeGreaterThan(0);
  });

  it('renders and destroys without errors', () => {
    const { tool, container } = renderTool();

    expect(container.querySelector('#minima-oca')).not.toBeNull();
    expect(container.querySelector('#minima-och')).not.toBeNull();
    expect(container.querySelector('#minima-aircraft')).not.toBeNull();
    expect(container.querySelector('#minima-operator')).not.toBeNull();

    expect(() => tool.destroy()).not.toThrow();
  });

  it('uses published OCH when it is above aircraft minima', () => {
    const { tool, container } = renderTool();

    (container.querySelector('#minima-oca') as HTMLInputElement).value = '1200';
    (container.querySelector('#minima-och') as HTMLInputElement).value = '400';
    (container.querySelector('#minima-aircraft') as HTMLInputElement).value = '300';
    (container.querySelector('#minima-operator') as HTMLInputElement).value = '20';

    (tool as any).calculate();

    const daText = container.querySelector('#result-da')?.textContent;
    const dhText = container.querySelector('#result-dh')?.textContent;
    const note = container.querySelector('#minima-note')?.textContent ?? '';

    expect(getNumericValue(daText)).toBe(1220); // 1200 + margin
    expect(getNumericValue(dhText)).toBe(420); // 400 + margin
    expect(note).toContain('Used published OCA/OCH');
  });

  it('applies aircraft minima when OCH is lower', () => {
    const { tool, container } = renderTool();

    (container.querySelector('#minima-oca') as HTMLInputElement).value = '1200';
    (container.querySelector('#minima-och') as HTMLInputElement).value = '150';
    (container.querySelector('#minima-aircraft') as HTMLInputElement).value = '300';
    (container.querySelector('#minima-operator') as HTMLInputElement).value = '25';

    (tool as any).calculate();

    const daText = container.querySelector('#result-da')?.textContent;
    const dhText = container.querySelector('#result-dh')?.textContent;
    const note = container.querySelector('#minima-note')?.textContent ?? '';

    expect(getNumericValue(daText)).toBe(1375); // 1200 + (300-150) + 25
    expect(getNumericValue(dhText)).toBe(325); // aircraft minima + margin
    expect(note).toContain('below the aircraft minima');
  });

  it('rejects missing values with an alert', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { tool } = renderTool();

    (tool as any).calculate();

    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
