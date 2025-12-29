import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import { copyToClipboard } from '../../utils/clipboard';

export type SpeedUnit = 'kt' | 'kmh' | 'ms' | 'ftmin';

const TO_MS: Record<SpeedUnit, number> = {
  kt: 0.514444,
  kmh: 1 / 3.6,
  ms: 1,
  ftmin: 0.00508,
};

const FROM_MS: Record<SpeedUnit, number> = {
  kt: 1 / 0.514444,
  kmh: 3.6,
  ms: 1,
  ftmin: 1 / 0.00508,
};

/**
 * UI component for converting speeds between knots, km/h, m/s, and ft/min.
 */
@Component({
  selector: 'app-speed-conversion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './speed-conversion.component.html',
  styleUrls: ['../tool-shared.css', './speed-conversion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedConversionComponent {
  readonly unitControl = new FormControl<SpeedUnit>('kt', { nonNullable: true });
  readonly valueControl = new FormControl('', { nonNullable: true });
  readonly results = signal<Record<SpeedUnit, string> | null>(null);
  readonly copiedField = signal<SpeedUnit | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly units: SpeedUnit[] = ['kt', 'kmh', 'ms', 'ftmin'];

  readonly visibleUnits = computed(() => this.units.filter((unit) => unit !== this.unitControl.value));

  convert(): void {
    try {
      const numericValue = parseFloat(this.valueControl.value);
      if (Number.isNaN(numericValue)) {
        throw new Error('Please enter a valid numeric speed value.');
      }
      if (numericValue < 0) {
        throw new Error('Speed value must be positive.');
      }

      const converted: Record<SpeedUnit, string> = {
        kt: `${this.formatSpeed(this.convertSpeed(numericValue, this.unitControl.value, 'kt'))} kt`,
        kmh: `${this.formatSpeed(this.convertSpeed(numericValue, this.unitControl.value, 'kmh'))} km/h`,
        ms: `${this.formatSpeed(this.convertSpeed(numericValue, this.unitControl.value, 'ms'))} m/s`,
        ftmin: `${this.formatSpeed(this.convertSpeed(numericValue, this.unitControl.value, 'ftmin'))} ft/min`,
      };

      this.results.set(converted);
      this.copiedField.set(null);
      this.scrollToResult();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert speed. Please check your input.';
      alert(message);
    }
  }

  async copy(field: SpeedUnit): Promise<void> {
    const currentResults = this.results();
    if (!currentResults) return;
    const success = await copyToClipboard(currentResults[field]);
    if (success) {
      this.copiedField.set(field);
      setTimeout(() => {
        this.copiedField.set(null);
      }, 1500);
    } else {
      alert('Unable to copy to clipboard.');
    }
  }

  private formatSpeed(value: number): string {
    if (value >= 1000) return value.toFixed(1);
    if (value >= 100) return value.toFixed(2);
    if (value >= 10) return value.toFixed(3);
    return value.toFixed(4);
  }

  convertSpeed(value: number, fromUnit: SpeedUnit, toUnit: SpeedUnit): number {
    const ms = value * TO_MS[fromUnit];
    return ms * FROM_MS[toUnit];
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
export const speedConversionTool: ToolDefinition = {
  id: 'speed-conversion',
  name: 'Speed Conversion',
  description: 'Convert between kt, km/h, m/s, and ft/min.',
  component: SpeedConversionComponent,
};
