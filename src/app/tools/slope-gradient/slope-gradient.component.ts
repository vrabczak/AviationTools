import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';

export type SlopeGradientUnit = 'slope' | 'gradient';

/** Converts a slope angle in degrees to gradient percent. */
export function slopeDegreesToGradientPercent(slopeDegrees: number): number {
  return Math.tan(slopeDegrees * Math.PI / 180) * 100;
}

/** Converts gradient percent to a slope angle in degrees. */
export function gradientPercentToSlopeDegrees(gradientPercent: number): number {
  return Math.atan(gradientPercent / 100) * 180 / Math.PI;
}

/** UI component for converting slope angle in degrees and gradient percent. */
@Component({
  selector: 'app-slope-gradient',
  imports: [ReactiveFormsModule],
  templateUrl: './slope-gradient.component.html',
  styleUrls: ['../tool-shared.css', './slope-gradient.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlopeGradientComponent {
  readonly unitControl = new FormControl<SlopeGradientUnit>('slope', { nonNullable: true });
  readonly valueControl = new FormControl<string | number>('', { nonNullable: true });
  readonly result = signal<number | null>(null);
  readonly errorMessage = signal('');

  readonly inputLabel = computed(() => this.unitControl.value === 'slope' ? 'Slope angle (°)' : 'Gradient (%)');
  readonly resultLabel = computed(() => this.unitControl.value === 'slope' ? 'Gradient' : 'Slope angle');
  readonly formattedResult = computed(() => {
    const value = this.result();
    if (value === null) return '';
    const unit = this.unitControl.value === 'slope' ? '%' : '°';
    return `${this.formatValue(value)} ${unit}`;
  });

  convert(): void {
    const rawValue = this.valueControl.value;
    const value = Number(rawValue);
    if (String(rawValue).trim() === '' || !Number.isFinite(value)) {
      this.setError('Enter a valid numeric value.');
      return;
    }

    if (this.unitControl.value === 'slope' && (value <= -90 || value >= 90)) {
      this.setError('Slope angle must be greater than −90° and less than 90°.');
      return;
    }

    const converted = this.unitControl.value === 'slope'
      ? slopeDegreesToGradientPercent(value)
      : gradientPercentToSlopeDegrees(value);
    this.errorMessage.set('');
    this.result.set(converted);
  }

  onUnitChange(): void {
    this.result.set(null);
    this.errorMessage.set('');
  }

  private setError(message: string): void {
    this.result.set(null);
    this.errorMessage.set(message);
  }

  private formatValue(value: number): string {
    return value.toLocaleString('en-US', { maximumFractionDigits: 4, useGrouping: false });
  }
}

/** Tool metadata for the slope and gradient converter. */
export const slopeGradientTool: ToolDefinition = {
  id: 'slope-gradient',
  name: 'Slope / Gradient',
  description: 'Convert between slope angle in degrees and gradient percent.',
  component: SlopeGradientComponent,
};
