import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FuelConsumptionQuantityEnduranceComponent,
  formatSecondsToTime,
  fuelConsumptionQuantityEnduranceTool,
  parseTimeToSeconds,
} from './fuel-consumption-quantity-endurance.component';

describe('FuelConsumptionQuantityEnduranceComponent', () => {
  let fixture: ComponentFixture<FuelConsumptionQuantityEnduranceComponent>;
  let component: FuelConsumptionQuantityEnduranceComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuelConsumptionQuantityEnduranceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FuelConsumptionQuantityEnduranceComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('parses HH:MM:SS to seconds', () => {
    expect(parseTimeToSeconds('01:30:15')).toBe(5415);
  });

  it('formats elapsed seconds as HH:MM:SS', () => {
    expect(formatSecondsToTime(5415)).toBe('01:30:15');
  });

  it('returns undefined for invalid HH:MM:SS input', () => {
    expect(parseTimeToSeconds('90:99')).toBeUndefined();
  });

  it('shows all supported consumption units', () => {
    const options = Array.from(element.querySelectorAll('#fcqe-consumption-unit option'))
      .map((option) => (option as HTMLOptionElement).value);
    expect(options).toEqual(['lpm', 'lph', 'kgpm', 'kgph']);
  });

  it('shows liter and kg quantity units', () => {
    const options = Array.from(element.querySelectorAll('#fcqe-quantity-unit option'))
      .map((option) => (option as HTMLOptionElement).value);
    expect(options).toEqual(['liter', 'kg']);
  });

  it('uses liter and liter/min as defaults', () => {
    expect(component.quantityUnitControl.value).toBe('liter');
    expect(component.consumptionUnitControl.value).toBe('lpm');
  });

  it('hides density input when quantity and consumption use the same basis', () => {
    fixture.detectChanges();
    expect(component.shouldShowDensityInput()).toBe(false);
    expect(element.querySelector('#fcqe-density')).toBeNull();
  });

  it('shows density input for cross-unit calculations', () => {
    component.quantityUnitControl.setValue('kg');
    fixture.detectChanges();

    expect(component.shouldShowDensityInput()).toBe(true);
    expect(element.querySelector('#fcqe-density')).not.toBeNull();
  });

  it('calculates endurance from consumption and quantity', () => {
    component.consumptionControl.setValue('20');
    component.quantityControl.setValue('1200');

    component.calculate();

    const result = component.result();
    expect(result?.enduranceSeconds).toBeCloseTo(3600, 2);
    expect(component.enduranceDisplay()).toBe('01:00:00');
  });

  it('calculates quantity from consumption and endurance with custom density', () => {
    component.consumptionUnitControl.setValue('kgph');
    component.quantityUnitControl.setValue('liter');
    component.consumptionControl.setValue('800');
    component.enduranceControl.setValue('00:30:00');
    component.densityControl.setValue('0.72');

    component.calculate();

    const result = component.result();
    expect(result?.quantity).toBeCloseTo(555.56, 2);
    expect(component.quantityDisplay()).toBe('555.56 L');
  });

  it('exposes metadata', () => {
    expect(fuelConsumptionQuantityEnduranceTool.id).toBe('fuel-consumption-quantity-endurance');
    expect(fuelConsumptionQuantityEnduranceTool.name).toBeTruthy();
  });
});
