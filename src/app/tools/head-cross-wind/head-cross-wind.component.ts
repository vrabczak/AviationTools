import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';

export type CrosswindSide = 'left' | 'right' | 'none';

/**
 * Normalizes a degree measurement to the range [0, 360).
 *
 * @param value - Angle in degrees, possibly outside 0–359.
 * @returns Equivalent angle within a full circle.
 */
export function normalizeDegrees(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

/**
 * Calculates headwind/tailwind and crosswind components relative to an aircraft heading.
 *
 * @param windSpeed - Wind speed in knots.
 * @param windDirection - Direction the wind is coming from, in degrees.
 * @param aircraftHeading - Aircraft or runway heading in degrees.
 * @returns Magnitudes for headwind and crosswind plus crosswind origin side.
 */
export function calculateWindComponents(
  windSpeed: number,
  windDirection: number,
  aircraftHeading: number
): { headwind: number; crosswind: number; crosswindFrom: CrosswindSide } {
  const relativeDirectionRad = ((windDirection - aircraftHeading) * Math.PI) / 180;
  const headwind = windSpeed * Math.cos(relativeDirectionRad);
  const crosswind = windSpeed * Math.sin(relativeDirectionRad);

  let crosswindFrom: CrosswindSide = 'none';
  if (Math.abs(crosswind) >= 0.05) {
    crosswindFrom = crosswind > 0 ? 'right' : 'left';
  }

  return { headwind, crosswind, crosswindFrom };
}

/**
 * UI component for computing headwind/tailwind and crosswind values for a given heading.
 */
@Component({
  selector: 'app-head-cross-wind',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './head-cross-wind.component.html',
  styleUrls: ['../tool-shared.css', './head-cross-wind.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeadCrossWindComponent {
  readonly windSpeedControl = new FormControl('', { nonNullable: true });
  readonly windDirectionControl = new FormControl('', { nonNullable: true });
  readonly aircraftHeadingControl = new FormControl('', { nonNullable: true });
  readonly result = signal<{ headwind: number; crosswind: number; crosswindFrom: CrosswindSide } | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  calculate(): void {
    const speed = parseFloat(this.windSpeedControl.value);
    const direction = parseFloat(this.windDirectionControl.value);
    const heading = parseFloat(this.aircraftHeadingControl.value);

    if (Number.isNaN(speed) || Number.isNaN(direction) || Number.isNaN(heading)) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    if (speed < 0) {
      alert('Wind speed must be zero or greater');
      return;
    }

    if (direction < 0 || direction > 360 || heading < 0 || heading > 360) {
      alert('Wind direction and aircraft heading must be between 0 and 360 degrees');
      return;
    }

    const normalizedWindDir = normalizeDegrees(direction);
    const normalizedHeading = normalizeDegrees(heading);

    this.result.set(calculateWindComponents(speed, normalizedWindDir, normalizedHeading));
    this.scrollToResult();
  }

  readonly headwindLabel = computed(() => {
    const current = this.result();
    return current ? (current.headwind >= 0 ? 'headwind' : 'tailwind') : '';
  });

  readonly crosswindLabel = computed(() => {
    const current = this.result();
    if (!current) return '';
    return current.crosswindFrom === 'none' ? 'no crosswind' : `from the ${current.crosswindFrom}`;
  });

  formatWindComponent(value: number): string {
    return (Math.round(Math.abs(value) * 10) / 10).toFixed(1);
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
export const headCrossWindTool: ToolDefinition = {
  id: 'head-cross-wind',
  name: 'Head/Cross Wind',
  description: 'Compute headwind and crosswind components for a given runway or heading',
  component: HeadCrossWindComponent,
};
