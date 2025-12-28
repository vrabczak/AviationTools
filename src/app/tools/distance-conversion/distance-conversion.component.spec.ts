import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue, setSelectValue } from '../../../testing/dom-helpers';
import { DistanceConversionComponent, distanceConversionTool } from './distance-conversion.component';

describe('DistanceConversion', () => {
  let fixture: ComponentFixture<DistanceConversionComponent>;
  let component: DistanceConversionComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistanceConversionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DistanceConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('converts meters to nautical miles', () => {
    const nm = component.convertDistance(1852, 'm', 'nm');
    expect(nm).toBeCloseTo(1, 4);
  });

  it('converts nautical miles to kilometers', () => {
    const km = component.convertDistance(1, 'nm', 'km');
    expect(km).toBeCloseTo(1.852, 3);
  });

  it('renders converted distances from meters', () => {
    setSelectValue(getById<HTMLSelectElement>(element, 'distance-unit'), 'm');
    setInputValue(getById<HTMLInputElement>(element, 'distance-input'), '1000');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'result-km').textContent?.trim()).toBe('1.0000 km');
  });

  it('exposes metadata', () => {
    expect(distanceConversionTool.id).toBe('distance-conversion');
    expect(distanceConversionTool.name).toBeTruthy();
  });
});
