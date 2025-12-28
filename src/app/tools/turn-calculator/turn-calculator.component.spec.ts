import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue } from '../../../testing/dom-helpers';
import { TurnCalculatorComponent, turnCalculatorTool } from './turn-calculator.component';

describe('TurnCalculator', () => {
  let fixture: ComponentFixture<TurnCalculatorComponent>;
  let component: TurnCalculatorComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnCalculatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TurnCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('calculates a turn radius', () => {
    const result = component.calculateTurn(120, 15);
    expect(result.radiusMeters).toBeGreaterThan(0);
    expect(result.time360Seconds).toBeGreaterThan(0);
  });

  it('renders turn results for valid inputs', () => {
    setInputValue(getById<HTMLInputElement>(element, 'speed'), '120');
    setInputValue(getById<HTMLInputElement>(element, 'bank-angle'), '15');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const expected = component.calculateTurn(120, 15);
    expect(getById<HTMLElement>(element, 'turn-radius').textContent?.trim())
      .toBe(expected.radiusMeters.toLocaleString());
    expect(getById<HTMLElement>(element, 'turn-time').textContent?.trim())
      .toBe(component.formatTurnTime());
    const rate = component.turnRateDegPerSec();
    if (rate === null) {
      throw new Error('Expected a turn rate after calculation.');
    }
    expect(getById<HTMLElement>(element, 'turn-rate').textContent?.trim())
      .toBe(rate.toFixed(2));
  });

  it('exposes metadata', () => {
    expect(turnCalculatorTool.id).toBe('turn-calculator');
    expect(turnCalculatorTool.name).toBeTruthy();
  });
});
