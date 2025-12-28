import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue, setSelectValue } from '../../../testing/dom-helpers';
import { FuelConversionComponent, fuelConversionTool } from './fuel-conversion.component';

describe('FuelConversion', () => {
  let fixture: ComponentFixture<FuelConversionComponent>;
  let component: FuelConversionComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuelConversionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FuelConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('converts pounds to liters using density', () => {
    const liters = component.convertToLiters(100, 'pound', 0.8);
    expect(liters).toBeGreaterThan(0);
  });

  it('returns all units', () => {
    const result = component.convertFuel(100, 'liters', 0.8);
    expect(result.kg).toBeCloseTo(80, 2);
    expect(result.gallon).toBeGreaterThan(0);
  });

  it('renders converted fuel values', () => {
    setSelectValue(getById<HTMLSelectElement>(element, 'fuel-unit'), 'liters');
    setInputValue(getById<HTMLInputElement>(element, 'fuel-value'), '100');
    setInputValue(getById<HTMLInputElement>(element, 'fuel-density'), '0.8');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'result-kg').textContent).toContain('80.00 kg');
  });

  it('exposes metadata', () => {
    expect(fuelConversionTool.id).toBe('fuel-conversion');
    expect(fuelConversionTool.name).toBeTruthy();
  });
});
