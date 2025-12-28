import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue } from '../../../testing/dom-helpers';
import { AltitudeCorrectionComponent, altitudeCorrectionTool } from './altitude-correction.component';

describe('AltitudeCorrection', () => {
  let fixture: ComponentFixture<AltitudeCorrectionComponent>;
  let component: AltitudeCorrectionComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltitudeCorrectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AltitudeCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('calculates a correction value', () => {
    const result = component.calculateTemperatureCorrection(1700, 1500, -10);
    expect(result.correctedAltitude).toBeGreaterThan(0);
    expect(result.correction).toBeGreaterThan(0);
  });

  it('renders corrected altitude results', () => {
    setInputValue(getById<HTMLInputElement>(element, 'decision-alt'), '500');
    setInputValue(getById<HTMLInputElement>(element, 'airport-alt'), '0');
    setInputValue(getById<HTMLInputElement>(element, 'temperature'), '15');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'corrected-alt').textContent?.trim()).toBe('500');
    expect(getById<HTMLElement>(element, 'correction-value').textContent?.trim()).toBe('+0');
    expect(getById<HTMLElement>(element, 'result-interpretation').textContent).toContain('Temperature matches ISA');
  });

  it('exposes metadata', () => {
    expect(altitudeCorrectionTool.id).toBe('altitude-correction');
    expect(altitudeCorrectionTool.name).toBeTruthy();
  });
});
