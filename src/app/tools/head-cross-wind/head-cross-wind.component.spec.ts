import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue } from '../../../testing/dom-helpers';
import { HeadCrossWindComponent, headCrossWindTool } from './head-cross-wind.component';
import { normalizeDegrees } from '../../utils/angles';

describe('HeadCrossWind', () => {
  let fixture: ComponentFixture<HeadCrossWindComponent>;
  let component: HeadCrossWindComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadCrossWindComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeadCrossWindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('normalizes degrees into 0-360', () => {
    expect(normalizeDegrees(370)).toBeCloseTo(10);
    expect(normalizeDegrees(-10)).toBeCloseTo(350);
  });

  it('calculates wind components', () => {
    const result = component.calculateWindComponents(20, 180, 180);
    expect(result.headwind).toBeCloseTo(20, 2);
    expect(result.crosswind).toBeCloseTo(0, 2);
  });

  it('renders wind component results', () => {
    setInputValue(getById<HTMLInputElement>(element, 'wind-speed'), '20');
    setInputValue(getById<HTMLInputElement>(element, 'wind-direction'), '180');
    setInputValue(getById<HTMLInputElement>(element, 'aircraft-heading'), '180');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const headwindText = getById<HTMLElement>(element, 'headwind-value').textContent ?? '';
    expect(headwindText).toContain('20.0');
    expect(headwindText).toContain('headwind');

    const crosswindText = getById<HTMLElement>(element, 'crosswind-value').textContent ?? '';
    expect(crosswindText).toContain('0.0');
    expect(crosswindText).toContain('no crosswind');
  });

  it('exposes metadata', () => {
    expect(headCrossWindTool.id).toBe('head-cross-wind');
    expect(headCrossWindTool.name).toBeTruthy();
  });
});
