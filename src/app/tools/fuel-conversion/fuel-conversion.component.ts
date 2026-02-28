import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import { copyToClipboard } from '../../utils/clipboard';

export type FuelUnit = 'liters' | 'kg' | 'gallon' | 'pound';

const LITERS_PER_GALLON = 3.785411784;
const KG_PER_POUND = 0.45359237;

/**
 * UI component for converting fuel between volume and weight using a density factor.
 */
@Component({
  selector: 'app-fuel-conversion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fuel-conversion.component.html',
  styleUrls: ['../tool-shared.css', './fuel-conversion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuelConversionComponent {
  private readonly injector = inject(Injector);

  readonly unitControl = new FormControl<FuelUnit>('liters', { nonNullable: true });
  readonly valueControl = new FormControl('', { nonNullable: true });
  readonly densityControl = new FormControl('0.8', { nonNullable: true });
  readonly results = signal<Record<FuelUnit, number> | null>(null);
  readonly copiedField = signal<FuelUnit | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly visibleUnits = computed(() =>
    (['liters', 'kg', 'gallon', 'pound'] as FuelUnit[]).filter((unit) => unit !== this.unitControl.value)
  );

  convert(): void {
    try {
      const numericValue = parseFloat(this.valueControl.value);
      const densityValue = parseFloat(this.densityControl.value);

      if (Number.isNaN(numericValue)) {
        throw new Error('Please enter a valid numeric value.');
      }

      if (Number.isNaN(densityValue) || densityValue <= 0) {
        throw new Error('Please enter a valid density greater than 0.');
      }

      this.results.set(this.convertFuel(numericValue, this.unitControl.value, densityValue));
      this.copiedField.set(null);
      this.scrollToResult();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert fuel. Please check your input.';
      alert(message);
    }
  }

  async copy(field: FuelUnit): Promise<void> {
    const currentResults = this.results();
    if (!currentResults) return;
    const valueText = (() => {
      const valueNumber = currentResults[field];
      switch (field) {
        case 'liters':
          return `${valueNumber.toFixed(2)} L`;
        case 'kg':
          return `${valueNumber.toFixed(2)} kg`;
        case 'gallon':
          return `${valueNumber.toFixed(2)} gal`;
        case 'pound':
          return `${valueNumber.toFixed(2)} lb`;
      }
    })();

    const success = await copyToClipboard(valueText);
    if (success) {
      this.copiedField.set(field);
      setTimeout(() => {
        this.copiedField.set(null);
      }, 1500);
    } else {
      alert('Unable to copy to clipboard.');
    }
  }

  convertToLiters(value: number, unit: FuelUnit, density: number): number {
    switch (unit) {
      case 'liters':
        return value;
      case 'kg':
        return value / density;
      case 'gallon':
        return value * LITERS_PER_GALLON;
      case 'pound':
        return (value * KG_PER_POUND) / density;
      default:
        throw new Error('Unsupported unit selected.');
    }
  }

  convertFuel(value: number, unit: FuelUnit, density: number): Record<FuelUnit, number> {
    const liters = this.convertToLiters(value, unit, density);
    const kg = liters * density;
    const gallon = liters / LITERS_PER_GALLON;
    const pound = kg / KG_PER_POUND;

    return { liters, kg, gallon, pound };
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
export const fuelConversionTool: ToolDefinition = {
  id: 'fuel-conversion',
  name: 'Fuel Conversion',
  description: 'Convert between liters, kg, gallons, and pounds using fuel density.',
  component: FuelConversionComponent,
};
