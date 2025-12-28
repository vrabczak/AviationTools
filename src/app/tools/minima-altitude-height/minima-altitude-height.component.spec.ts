import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue } from '../../../testing/dom-helpers';
import { MinimaAltitudeHeightComponent, minimaAltitudeHeightTool } from './minima-altitude-height.component';

describe('MinimaAltitudeHeight', () => {
  let fixture: ComponentFixture<MinimaAltitudeHeightComponent>;
  let component: MinimaAltitudeHeightComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinimaAltitudeHeightComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MinimaAltitudeHeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('uses aircraft minima when OCH is lower', () => {
    const result = component.calculateMinima(1500, 200, 250, 50);
    expect(result.usesAircraftMinima).toBeTrue();
    expect(result.decisionAltitude).toBeGreaterThan(1500);
  });

  it('renders computed DA and DH values', () => {
    setInputValue(getById<HTMLInputElement>(element, 'minima-oca'), '500');
    setInputValue(getById<HTMLInputElement>(element, 'minima-och'), '200');
    setInputValue(getById<HTMLInputElement>(element, 'minima-aircraft'), '250');
    setInputValue(getById<HTMLInputElement>(element, 'minima-operator'), '50');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'result-da').textContent?.trim()).toBe('600');
    expect(getById<HTMLElement>(element, 'result-dh').textContent?.trim()).toBe('300');
    expect(getById<HTMLElement>(element, 'minima-note').textContent).toContain('Always crosscheck');
  });

  it('exposes metadata', () => {
    expect(minimaAltitudeHeightTool.id).toBe('minima');
    expect(minimaAltitudeHeightTool.name).toBeTruthy();
  });
});
