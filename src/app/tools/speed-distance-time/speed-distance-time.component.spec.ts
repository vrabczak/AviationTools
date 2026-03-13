import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SpeedDistanceTimeComponent,
  formatSecondsToTime,
  parseTimeToSeconds,
  speedDistanceTimeTool,
} from './speed-distance-time.component';

describe('SpeedDistanceTimeComponent', () => {
  let fixture: ComponentFixture<SpeedDistanceTimeComponent>;
  let component: SpeedDistanceTimeComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeedDistanceTimeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpeedDistanceTimeComponent);
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


  it('shows only kt and km/h speed units', () => {
    const options = Array.from(element.querySelectorAll('#sdt-speed-unit option'))
      .map((option) => (option as HTMLOptionElement).value);
    expect(options).toEqual(['kt', 'kmh']);
  });

  it('shows only NM and km distance units', () => {
    const options = Array.from(element.querySelectorAll('#sdt-distance-unit option'))
      .map((option) => (option as HTMLOptionElement).value);
    expect(options).toEqual(['nm', 'km']);
  });

  it('calculates distance from speed and time', () => {
    component.speedControl.setValue('120');
    component.timeControl.setValue('01:30:00');

    component.calculate();

    const result = component.result();
    expect(result?.distance).toBeCloseTo(180, 2);
    expect(component.distanceDisplay()).toBe('180.00 NM');
  });

  it('calculates time from speed and distance via UI', () => {
    const speedInput = element.querySelector('#sdt-speed') as HTMLInputElement;
    const distanceInput = element.querySelector('#sdt-distance') as HTMLInputElement;
    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;

    speedInput.value = '120';
    speedInput.dispatchEvent(new Event('input'));
    distanceInput.value = '60';
    distanceInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    button.click();
    fixture.detectChanges();

    const time = (element.querySelector('#sdt-result-time') as HTMLElement).textContent?.trim();
    expect(time).toBe('00:30:00');
  });

  it('exposes metadata', () => {
    expect(speedDistanceTimeTool.id).toBe('speed-distance-time');
    expect(speedDistanceTimeTool.name).toBeTruthy();
  });
});
