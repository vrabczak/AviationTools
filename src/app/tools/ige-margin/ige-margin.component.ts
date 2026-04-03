import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import { IgeAltitudeUnit, convertIgeAltitudeToMeters, getIgeWindCorrectionMaxVelocityMps, lookupIgeLimitKg, lookupIgeWindCorrectionKg } from './ige-margin.helper';
import { IgeWindDirection } from './ige-margin.wind-correction.data';

interface IgeMarginResult {
  marginKg: number;
  limitKg: number;
  correctedLimitKg: number;
  correctedMarginKg: number;
  windApplied: boolean;
  windCorrectionKg: number;
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
  private readonly windVelocityLimitsKt = {
    headwind: formatIgeKnots(getIgeWindCorrectionMaxVelocityMps('headwind')),
    crosswind: formatIgeKnots(getIgeWindCorrectionMaxVelocityMps('crosswind')),
    tailwind: formatIgeKnots(getIgeWindCorrectionMaxVelocityMps('tailwind')),
  } satisfies Record<IgeWindDirection, string>;

  readonly grossWeightControl = new FormControl('', { nonNullable: true });
  readonly temperatureControl = new FormControl('', { nonNullable: true });
  readonly altitudeControl = new FormControl('', { nonNullable: true });
  readonly altitudeUnitControl = new FormControl<IgeAltitudeUnit>('ft', { nonNullable: true });
  readonly windVelocityControl = new FormControl('', { nonNullable: true });
  readonly windDirectionControl = new FormControl<IgeWindDirection | ''>('', { nonNullable: true });

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

  readonly correctedLimitDisplay = computed(() => {
    const calculation = this.result();
    return calculation ? `${formatIgeKilograms(calculation.correctedLimitKg)} kg` : '-';
  });

  readonly correctedMarginDisplay = computed(() => {
    const calculation = this.result();
    return calculation ? `${formatIgeKilograms(calculation.correctedMarginKg)} kg` : '-';
  });

  readonly windCorrectionDisplay = computed(() => {
    const calculation = this.result();
    return calculation ? `${formatSignedIgeKilograms(calculation.windCorrectionKg)} kg` : '-';
  });

  calculate(): void {
    const grossWeight = this.parseNumericField(this.grossWeightControl.value, 'Gross weight', false);
    const temperature = this.parseNumericField(this.temperatureControl.value, 'Temperature', true);
    const altitude = this.parseNumericField(this.altitudeControl.value, 'Altitude', false);
    const windVelocity = this.parseNumericField(this.windVelocityControl.value, 'Wind velocity', false);

    if (grossWeight === undefined || temperature === undefined || altitude === undefined || windVelocity === undefined) {
      return;
    }
    if (grossWeight === null || temperature === null || altitude === null) {
      alert('Enter Gross Weight, Temperature, and Altitude.');
      return;
    }

    const windDirection = this.windDirectionControl.value;
    const windApplied = windVelocity !== null || windDirection !== '';
    if ((windVelocity === null) !== (windDirection === '')) {
      alert('Enter both Wind velocity and Wind direction, or leave both blank.');
      return;
    }

    try {
      const altitudeMeters = convertIgeAltitudeToMeters(altitude, this.altitudeUnitControl.value);
      const limitKg = lookupIgeLimitKg(altitudeMeters, temperature);
      const windCorrectionKg = windApplied && windVelocity !== null && windDirection !== ''
        ? this.lookupWindCorrectionFromKnots(windVelocity, windDirection)
        : 0;
      const correctedLimitKg = limitKg + windCorrectionKg;
      this.result.set({
        marginKg: limitKg - grossWeight,
        limitKg,
        correctedLimitKg,
        correctedMarginKg: correctedLimitKg - grossWeight,
        windApplied,
        windCorrectionKg,
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

  private lookupWindCorrectionFromKnots(windVelocityKt: number, direction: IgeWindDirection): number {
    const maxWindVelocityMps = getIgeWindCorrectionMaxVelocityMps(direction);
    const maxWindVelocityKt = metersPerSecondToKnots(maxWindVelocityMps);
    if (windVelocityKt > maxWindVelocityKt) {
      throw new Error(`Wind velocity for ${direction} must be between 0 kt and ${this.windVelocityLimitsKt[direction]} kt.`);
    }

    return lookupIgeWindCorrectionKg(knotsToMetersPerSecond(windVelocityKt), direction);
  }
}

function formatIgeKilograms(value: number): string {
  return Math.round(value).toFixed(0);
}

function formatSignedIgeKilograms(value: number): string {
  const roundedValue = Math.round(value);
  if (roundedValue > 0) {
    return `+${roundedValue}`;
  }
  if (roundedValue < 0) {
    return `${roundedValue}`;
  }
  return '0';
}

function knotsToMetersPerSecond(valueKt: number): number {
  return valueKt * 0.514444;
}

function metersPerSecondToKnots(valueMps: number): number {
  return valueMps / 0.514444;
}

function formatIgeKnots(valueMps: number): string {
  return (Math.round(metersPerSecondToKnots(valueMps) * 10) / 10).toFixed(1);
}

/**
 * Tool metadata used by the application registry.
 */
export const igeMarginTool: ToolDefinition = {
  id: 'ige-margin',
  name: 'IGE Margin',
  description: 'Calculate IGE margin from gross weight, temperature, altitude and wind.',
  component: IgeMarginComponent,
};
