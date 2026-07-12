import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue, setSelectValue } from '../../../testing/dom-helpers';
import {
  gradientPercentToSlopeDegrees,
  slopeDegreesToGradientPercent,
  SlopeGradientComponent,
  slopeGradientTool,
} from './slope-gradient.component';

describe('SlopeGradientComponent', () => {
  let fixture: ComponentFixture<SlopeGradientComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SlopeGradientComponent] }).compileComponents();
    fixture = TestBed.createComponent(SlopeGradientComponent);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('converts slope degrees to gradient percent', () => {
    expect(slopeDegreesToGradientPercent(3)).toBeCloseTo(5.2408, 4);
  });

  it('converts gradient percent to slope degrees', () => {
    expect(gradientPercentToSlopeDegrees(5)).toBeCloseTo(2.8624, 4);
  });

  it('renders a converted gradient', () => {
    setInputValue(getById<HTMLInputElement>(element, 'slope-gradient-value'), '3');
    element.querySelector<HTMLButtonElement>('.btn-primary')?.click();
    fixture.detectChanges();
    expect(getById<HTMLElement>(element, 'slope-gradient-result').textContent?.trim()).toBe('5.2408 %');
  });

  it('renders a converted slope angle', () => {
    setSelectValue(getById<HTMLSelectElement>(element, 'slope-gradient-unit'), 'gradient');
    fixture.detectChanges();
    setInputValue(getById<HTMLInputElement>(element, 'slope-gradient-value'), '5');
    element.querySelector<HTMLButtonElement>('.btn-primary')?.click();
    fixture.detectChanges();
    expect(getById<HTMLElement>(element, 'slope-gradient-result').textContent?.trim()).toBe('2.8624 °');
  });

  it('rejects a vertical slope angle', () => {
    setInputValue(getById<HTMLInputElement>(element, 'slope-gradient-value'), '90');
    element.querySelector<HTMLButtonElement>('.btn-primary')?.click();
    fixture.detectChanges();
    expect(getById<HTMLElement>(element, 'slope-gradient-error').textContent).toContain('less than 90°');
  });

  it('exposes tool metadata', () => {
    expect(slopeGradientTool.id).toBe('slope-gradient');
  });
});
