import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import { copyToClipboard } from '../../utils/clipboard';

export type DistanceUnit = 'm' | 'km' | 'nm' | 'ft' | 'sm';

const TO_M: Record<DistanceUnit, number> = {
  m: 1,
  km: 1000,
  nm: 1852,
  ft: 0.3048,
  sm: 1609.344,
};

const FROM_M: Record<DistanceUnit, number> = {
  m: 1,
  km: 1 / 1000,
  nm: 1 / 1852,
  ft: 1 / 0.3048,
  sm: 1 / 1609.344,
};

/**
 * UI component for converting distances between aviation-relevant units.
 */
@Component({
  selector: 'app-distance-conversion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './distance-conversion.component.html',
  styleUrls: ['../tool-shared.css', './distance-conversion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistanceConversionComponent {
  readonly unitControl = new FormControl<DistanceUnit>('m', { nonNullable: true });
  readonly valueControl = new FormControl('', { nonNullable: true });
  readonly results = signal<Record<DistanceUnit, string> | null>(null);
  readonly copiedField = signal<DistanceUnit | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly units: DistanceUnit[] = ['m', 'km', 'nm', 'ft', 'sm'];

  readonly visibleUnits = computed(() => this.units.filter((unit) => unit !== this.unitControl.value));

  convert(): void {
    try {
      const numericValue = parseFloat(this.valueControl.value);
      if (Number.isNaN(numericValue)) {
        throw new Error('Please enter a valid numeric distance value.');
      }
      if (numericValue < 0) {
        throw new Error('Distance value must be positive.');
      }

      const converted: Record<DistanceUnit, string> = {
        m: `${this.formatDistance(this.convertDistance(numericValue, this.unitControl.value, 'm'))} m`,
        km: `${this.formatDistance(this.convertDistance(numericValue, this.unitControl.value, 'km'))} km`,
        nm: `${this.formatDistance(this.convertDistance(numericValue, this.unitControl.value, 'nm'))} NM`,
        ft: `${this.formatDistance(this.convertDistance(numericValue, this.unitControl.value, 'ft'))} ft`,
        sm: `${this.formatDistance(this.convertDistance(numericValue, this.unitControl.value, 'sm'))} SM`,
      };

      this.results.set(converted);
      this.copiedField.set(null);
      this.scrollToResult();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert distance. Please check your input.';
      alert(message);
    }
  }

  async copy(field: DistanceUnit): Promise<void> {
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

  private formatDistance(value: number): string {
    if (value >= 1000) return value.toFixed(1);
    if (value >= 100) return value.toFixed(2);
    if (value >= 10) return value.toFixed(3);
    return value.toFixed(4);
  }

  convertDistance(value: number, fromUnit: DistanceUnit, toUnit: DistanceUnit): number {
    const meters = value * TO_M[fromUnit];
    return meters * FROM_M[toUnit];
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
export const distanceConversionTool: ToolDefinition = {
  id: 'distance-conversion',
  name: 'Distance Conversion',
  description: 'Convert between m, km, NM, ft, and SM',
  component: DistanceConversionComponent,
};
