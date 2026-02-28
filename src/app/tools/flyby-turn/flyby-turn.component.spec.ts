import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue, setSelectValue } from '../../../testing/dom-helpers';
import { FlybyTurnComponent, flybyTurnTool } from './flyby-turn.component';

describe('FlybyTurn', () => {
  let fixture: ComponentFixture<FlybyTurnComponent>;
  let component: FlybyTurnComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlybyTurnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlybyTurnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders fly-by turn results for valid inputs', () => {
    setInputValue(getById<HTMLInputElement>(element, 'inbound-track'), '90');
    setInputValue(getById<HTMLInputElement>(element, 'outbound-track'), '135');
    setInputValue(getById<HTMLInputElement>(element, 'bank-angle'), '25');
    setInputValue(getById<HTMLInputElement>(element, 'ground-speed'), '180');
    setSelectValue(getById<HTMLSelectElement>(element, 'distance-unit'), 'nm');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const result = component.result();
    if (!result) {
      throw new Error('Expected a fly-by turn result.');
    }
    expect(parseFloat(getById<HTMLElement>(element, 'turn-anticipation-distance').textContent ?? ''))
      .toBeCloseTo(result.anticipationDistance, 4);
    expect(getById<HTMLElement>(element, 'turn-radius').textContent?.trim())
      .toBe(component.formatDistance(result.turnRadius ?? 0));
  });

  it('shows validation feedback for invalid inputs', () => {
    setInputValue(getById<HTMLInputElement>(element, 'inbound-track'), '-1');
    setInputValue(getById<HTMLInputElement>(element, 'outbound-track'), '110');
    setInputValue(getById<HTMLInputElement>(element, 'bank-angle'), '25');
    setInputValue(getById<HTMLInputElement>(element, 'ground-speed'), '180');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(component.result()).toBeNull();
    expect(component.errorMessage()).toContain('Inbound and outbound track');
  });

  it('supports km as output distance unit', () => {
    component.inboundTrackControl.setValue('90');
    component.outboundTrackControl.setValue('180');
    component.bankAngleControl.setValue('25');
    component.groundSpeedControl.setValue('160');
    component.unitControl.setValue('km');

    component.calculate();
    fixture.detectChanges();

    const result = component.result();
    if (!result) {
      throw new Error('Expected a fly-by turn result.');
    }

    expect(result.unit).toBe('km');
    expect(result.anticipationDistance).toBeGreaterThan(0);
    if (result.turnRadius === null) {
      throw new Error('Expected a finite turn radius for non-zero turn.');
    }
    expect(result.turnRadius).toBeGreaterThan(0);
  });

  it('shows a validation error for turn difference above model limit', () => {
    setInputValue(getById<HTMLInputElement>(element, 'inbound-track'), '90');
    setInputValue(getById<HTMLInputElement>(element, 'outbound-track'), '270');
    setInputValue(getById<HTMLInputElement>(element, 'bank-angle'), '25');
    setInputValue(getById<HTMLInputElement>(element, 'ground-speed'), '180');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(component.result()).toBeNull();
    expect(component.errorMessage()).toContain('Turn difference must be 179 deg or less');
  });

  it('exposes metadata', () => {
    expect(flybyTurnTool.id).toBe('flyby-turn');
    expect(flybyTurnTool.name).toBeTruthy();
  });
});
