import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';

export interface TurnResult {
  radiusMeters: number;
  time360Seconds: number;
}

/**
 * Calculates turn radius and time for a full 360° turn given speed and bank angle.
 *
 * @param speedKnots - True airspeed in knots.
 * @param bankAngle - Bank angle in degrees.
 * @returns Turn radius in meters and time for a complete turn in seconds.
 */
/**
 * UI component that computes turn performance metrics for a selected bank angle.
 */
@Component({
  selector: 'app-turn-calculator',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './turn-calculator.component.html',
  styleUrls: ['../tool-shared.css', './turn-calculator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnCalculatorComponent {
  readonly speedControl = new FormControl('', { nonNullable: true });
  readonly bankAngleControl = new FormControl('', { nonNullable: true });
  readonly result = signal<TurnResult | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  calculate(): void {
    const speedValue = parseFloat(this.speedControl.value);
    const bankValue = parseFloat(this.bankAngleControl.value);

    if (Number.isNaN(speedValue) || Number.isNaN(bankValue)) {
      alert('Please fill in all fields with valid numbers.');
      return;
    }

    if (speedValue <= 0) {
      alert('Speed must be greater than 0.');
      return;
    }

    if (bankValue <= 0 || bankValue >= 90) {
      alert('Bank angle must be between 0 and 90 degrees.');
      return;
    }

    this.result.set(this.calculateTurn(speedValue, bankValue));
    this.scrollToResult();
  }

  calculateTurn(speedKnots: number, bankAngle: number): TurnResult {
    if (bankAngle === 0 || bankAngle >= 90) {
      return { radiusMeters: Infinity, time360Seconds: Infinity };
    }

    const speedMps = speedKnots * 0.514444;
    const bankRad = (bankAngle * Math.PI) / 180;
    const radius = (speedMps * speedMps) / (9.81 * Math.tan(bankRad));
    const turnRateDegPerSec = ((9.81 * Math.tan(bankRad)) / speedMps) * (180 / Math.PI);
    const time360 = 360 / turnRateDegPerSec;

    return {
      radiusMeters: Math.round(radius),
      time360Seconds: Math.round(time360),
    };
  }

  readonly turnRateDegPerSec = computed(() => {
    const current = this.result();
    return current ? 360 / current.time360Seconds : null;
  });

  readonly interpretation = computed(() => {
    const rate = this.turnRateDegPerSec();
    if (rate === null) return '';
    if (rate >= 2.9 && rate <= 3.1) {
      return 'This is approximately a standard rate turn (3°/sec).';
    }
    return rate > 3.1
      ? 'This is faster than a standard rate turn.'
      : 'This is slower than a standard rate turn.';
  });

  formatTurnTime(): string {
    const current = this.result();
    if (!current) return '-';
    const minutes = Math.floor(current.time360Seconds / 60);
    const seconds = Math.round(current.time360Seconds % 60);
    return `${minutes}m ${seconds}s`;
  }

  private scrollToResult(): void {
    const element = this.resultRef?.nativeElement;
    if (!element) return;
    setTimeout(() => {
      try {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        element.scrollIntoView();
      }
    }, 0);
  }
}

/**
 * Tool metadata used by the application registry.
 */
export const turnCalculatorTool: ToolDefinition = {
  id: 'turn-calculator',
  name: 'Turn Calculator',
  description: 'Calculate turn radius and rate based on speed and bank angle',
  component: TurnCalculatorComponent,
};
