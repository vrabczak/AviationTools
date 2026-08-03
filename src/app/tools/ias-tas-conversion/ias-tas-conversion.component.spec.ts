import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  calculateTas,
  standardPressureAtFlightLevel,
  standardTemperatureAtFlightLevel,
} from './ias-tas-conversion.helper';
import { IasTasConversionComponent, iasTasConversionTool } from './ias-tas-conversion.component';

describe('IasTasConversion', () => {
  let fixture: ComponentFixture<IasTasConversionComponent>;
  let component: IasTasConversionComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IasTasConversionComponent] }).compileComponents();
    fixture = TestBed.createComponent(IasTasConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('returns IAS at ISA sea level', () => {
    expect(calculateTas(100, 0, 15)).toBeCloseTo(100, 8);
  });

  it('returns ISA temperature for a flight level', () => {
    expect(standardTemperatureAtFlightLevel(0)).toBeCloseTo(15, 8);
    expect(standardTemperatureAtFlightLevel(100)).toBeCloseTo(-4.812, 3);
    expect(standardTemperatureAtFlightLevel(400)).toBeCloseTo(-56.5, 8);
  });

  it('automatically fills OAT from flight level', () => {
    component.flightLevelControl.setValue('100');
    component.onFlightLevelChange();

    expect(component.oatControl.value).toBe('-4.8');
  });

  it('does not change flight level when OAT is changed manually', () => {
    component.flightLevelControl.setValue('100');
    component.onFlightLevelChange();
    component.oatControl.setValue('-20');

    expect(component.flightLevelControl.value).toBe('100');
    expect(component.oatControl.value).toBe('-20');
  });

  it('calculates TAS at FL100 and minus 5 degrees Celsius', () => {
    expect(calculateTas(120, 100, -5)).toBeCloseTo(139.6, 1);
    expect(standardPressureAtFlightLevel(100) / 100).toBeCloseTo(696.8, 1);
  });

  it('renders the calculated TAS', () => {
    component.flightLevelControl.setValue('100');
    component.oatControl.setValue('-5');
    component.iasControl.setValue('120');
    component.calculate();
    fixture.detectChanges();

    expect(element.querySelector('#result-tas')?.textContent?.trim()).toBe('139.6');
  });

  it('exposes tool metadata', () => {
    expect(iasTasConversionTool.id).toBe('ias-tas-conversion');
    expect(iasTasConversionTool.name).toBe('IAS to TAS');
  });
});
