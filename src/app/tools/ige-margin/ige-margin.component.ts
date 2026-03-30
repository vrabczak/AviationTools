import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import { IgeAltitudeUnit, convertIgeAltitudeToMeters, lookupIgeLimitKg } from './ige-margin.helper';

interface IgeMarginResult {
  marginKg: number;
  limitKg: number;
}

/**
 * Calculates IGE margin from gross weight, temperature, and altitude.
 */
@Component({
  selector: 'app-ige-margin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ige-margin.component.html',
  styleUrls: ['../tool-shared.css', './ige-margin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IgeMarginComponent {
  private readonly injector = inject(Injector);

  readonly grossWeightControl = new FormControl('', { nonNullable: true });
  readonly temperatureControl = new FormControl('', { nonNullable: true });
  readonly altitudeControl = new FormControl('', { nonNullable: true });
  readonly altitudeUnitControl = new FormControl<IgeAltitudeUnit>('ft', { nonNullable: true });

  readonly result = signal<IgeMarginResult | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly marginDisplay = computed(() => {
    const calculation = this.result();
    return calculation ? `${formatIgeKilograms(calculation.marginKg)} kg` : '-';
  });

  readonly limitDisplay = computed(() => {
    const calculation = this.result();
    return calculation ? `${formatIgeKilograms(calculation.limitKg)} kg` : '-';
  });

  calculate(): void {
    const grossWeight = this.parseNumericField(this.grossWeightControl.value, 'Gross weight', false);
    const temperature = this.parseNumericField(this.temperatureControl.value, 'Temperature', true);
    const altitude = this.parseNumericField(this.altitudeControl.value, 'Altitude', false);

    if (grossWeight === undefined || temperature === undefined || altitude === undefined) {
      return;
    }
    if (grossWeight === null || temperature === null || altitude === null) {
      alert('Enter Gross Weight, Temperature, and Altitude.');
      return;
    }

    try {
      const altitudeMeters = convertIgeAltitudeToMeters(altitude, this.altitudeUnitControl.value);
      const limitKg = lookupIgeLimitKg(altitudeMeters, temperature);
      this.result.set({
        marginKg: limitKg - grossWeight,
        limitKg,
      });
      this.scrollToResult();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Unable to calculate IGE margin.');
    }
  }

  private parseNumericField(rawValue: unknown, label: string, allowNegative: boolean): number | null | undefined {
    if (rawValue === null || rawValue === undefined) {
      return null;
    }

    const normalized = String(rawValue).trim();
    if (!normalized) {
      return null;
    }

    const value = Number.parseFloat(normalized);
    if (Number.isNaN(value) || (!allowNegative && value < 0)) {
      const constraint = allowNegative ? 'a valid number' : 'a valid number greater than or equal to zero';
      alert(`${label} must be ${constraint}.`);
      return undefined;
    }

    return value;
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

function formatIgeKilograms(value: number): string {
  return Math.round(value).toFixed(0);
}

/**
 * Tool metadata used by the application registry.
 */
export const igeMarginTool: ToolDefinition = {
  id: 'ige-margin',
  name: 'IGE Margin',
  description: 'Calculate IGE margin from gross weight, temperature, and altitude.',
  component: IgeMarginComponent,
};
