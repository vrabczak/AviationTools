import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue, setSelectValue } from '../../../testing/dom-helpers';
import { SpeedConversionComponent, speedConversionTool } from './speed-conversion.component';

describe('SpeedConversion', () => {
  let fixture: ComponentFixture<SpeedConversionComponent>;
  let component: SpeedConversionComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeedConversionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpeedConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('converts knots to m/s', () => {
    const ms = component.convertSpeed(100, 'kt', 'ms');
    expect(ms).toBeCloseTo(51.4444, 3);
  });

  it('converts m/s to km/h', () => {
    const kmh = component.convertSpeed(10, 'ms', 'kmh');
    expect(kmh).toBeCloseTo(36, 2);
  });

  it('renders converted speeds from knots', () => {
    setSelectValue(getById<HTMLSelectElement>(element, 'speed-unit'), 'kt');
    setInputValue(getById<HTMLInputElement>(element, 'speed-input'), '100');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'result-kmh').textContent?.trim()).toBe('185.20 km/h');
  });

  it('exposes metadata', () => {
    expect(speedConversionTool.id).toBe('speed-conversion');
    expect(speedConversionTool.name).toBeTruthy();
  });
});
