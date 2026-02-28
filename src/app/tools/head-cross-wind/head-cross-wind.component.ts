import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import { normalizeDegrees } from '../../utils/angles';

export type CrosswindSide = 'left' | 'right' | 'none';

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
  private readonly injector = inject(Injector);

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
      alert('Please fill in all fields with valid numbers.');
      return;
    }

    if (speed < 0) {
      alert('Wind speed must be zero or greater.');
      return;
    }

    if (direction < 0 || direction > 360 || heading < 0 || heading > 360) {
      alert('Wind direction and aircraft heading must be between 0 and 360 degrees.');
      return;
    }

    const normalizedWindDir = normalizeDegrees(direction);
    const normalizedHeading = normalizeDegrees(heading);

    this.result.set(this.calculateWindComponents(speed, normalizedWindDir, normalizedHeading));
    this.scrollToResult();
  }

  calculateWindComponents(
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
    afterNextRender(() => {
      const element = this.resultRef?.nativeElement;
      if (!element) return;
      try {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        element.scrollIntoView();
      }
    }, { injector: this.injector });
  }
}

/**
 * Tool metadata used by the application registry.
 */
export const headCrossWindTool: ToolDefinition = {
  id: 'head-cross-wind',
  name: 'Head/Cross Wind',
  description: 'Compute headwind and crosswind components for a given runway or heading.',
  component: HeadCrossWindComponent,
};
