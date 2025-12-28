import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue } from '../../../testing/dom-helpers';
import { TrackGroundSpeedComponent, trackGroundSpeedTool } from './track-ground-speed.component';

describe('TrackGroundSpeed', () => {
  let fixture: ComponentFixture<TrackGroundSpeedComponent>;
  let component: TrackGroundSpeedComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackGroundSpeedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackGroundSpeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('calculates ground track and speed', () => {
    const { groundTrack, groundSpeed } = component.calculateGroundVector(210, 125, 240, 18);
    expect(groundTrack).toBeGreaterThan(0);
    expect(groundSpeed).toBeGreaterThan(0);
  });

  it('handles calm wind', () => {
    const { groundTrack, groundSpeed } = component.calculateGroundVector(90, 100, 0, 0);
    expect(groundTrack).toBeCloseTo(90, 1);
    expect(groundSpeed).toBeCloseTo(100, 1);
  });

  it('renders ground track and speed results', () => {
    setInputValue(getById<HTMLInputElement>(element, 'wind-direction'), '180');
    setInputValue(getById<HTMLInputElement>(element, 'wind-speed'), '20');
    setInputValue(getById<HTMLInputElement>(element, 'aircraft-heading'), '180');
    setInputValue(getById<HTMLInputElement>(element, 'aircraft-tas'), '100');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'ground-track').textContent?.trim()).toBe('180');
    expect(getById<HTMLElement>(element, 'ground-speed').textContent?.trim()).toBe('80.0');
    expect(getById<HTMLElement>(element, 'ground-interpretation').textContent).toContain('Groundspeed');
  });

  it('exposes metadata', () => {
    expect(trackGroundSpeedTool.id).toBe('track-ground-speed');
    expect(trackGroundSpeedTool.name).toBeTruthy();
  });
});
