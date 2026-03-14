import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';

export type FuelQuantityUnit = 'liter' | 'kg';
export type FuelConsumptionUnit = 'kgph' | 'kgpm' | 'lph' | 'lpm';

const DEFAULT_FUEL_DENSITY_KG_PER_LITER = 0.8;

interface FuelCalcResult {
  consumption: number;
  quantity: number;
  enduranceSeconds: number;
}

/**
 * Calculates one missing value between fuel consumption, fuel quantity, and endurance.
 */
@Component({
  selector: 'app-fuel-consumption-quantity-endurance',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fuel-consumption-quantity-endurance.component.html',
  styleUrls: ['../tool-shared.css', './fuel-consumption-quantity-endurance.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuelConsumptionQuantityEnduranceComponent {
  private readonly injector = inject(Injector);

  readonly quantityUnitControl = new FormControl<FuelQuantityUnit>('liter', { nonNullable: true });
  readonly consumptionUnitControl = new FormControl<FuelConsumptionUnit>('lpm', { nonNullable: true });

  readonly consumptionControl = new FormControl('', { nonNullable: true });
  readonly quantityControl = new FormControl('', { nonNullable: true });
  readonly enduranceControl = new FormControl('', { nonNullable: true });
  readonly densityControl = new FormControl(`${DEFAULT_FUEL_DENSITY_KG_PER_LITER}`, { nonNullable: true });

  readonly result = signal<FuelCalcResult | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly consumptionDisplay = computed(() => {
    const current = this.result();
    return current ? `${current.consumption.toFixed(2)} ${this.consumptionUnitLabel(this.consumptionUnitControl.value)}` : '-';
  });

  readonly quantityDisplay = computed(() => {
    const current = this.result();
    return current ? `${current.quantity.toFixed(2)} ${this.quantityUnitLabel(this.quantityUnitControl.value)}` : '-';
  });

  readonly enduranceDisplay = computed(() => {
    const current = this.result();
    return current ? formatSecondsToTime(current.enduranceSeconds) : '-';
  });

  calculate(): void {
    const parsed = this.parseInputs();
    if (!parsed) {
      return;
    }

    const quantityUnit = this.quantityUnitControl.value;
    const consumptionUnit = this.consumptionUnitControl.value;
    const densityKgPerLiter = this.shouldShowDensityInput() ? parsed.densityKgPerLiter : DEFAULT_FUEL_DENSITY_KG_PER_LITER;

    const quantityKg = parsed.quantity === null ? null : this.quantityToKg(parsed.quantity, quantityUnit, densityKgPerLiter);
    const consumptionKgPerSecond = parsed.consumption === null
      ? null
      : this.consumptionToKgPerSecond(parsed.consumption, consumptionUnit, densityKgPerLiter);

    let resultQuantityKg = quantityKg;
    let resultConsumptionKgPerSecond = consumptionKgPerSecond;
    let resultEnduranceSeconds = parsed.enduranceSeconds;

    if (resultConsumptionKgPerSecond === null && resultQuantityKg !== null && resultEnduranceSeconds !== null) {
      if (resultEnduranceSeconds <= 0) {
        alert('Endurance must be greater than 00:00:00 to calculate consumption.');
        return;
      }
      resultConsumptionKgPerSecond = resultQuantityKg / resultEnduranceSeconds;
    }

    if (resultQuantityKg === null && resultConsumptionKgPerSecond !== null && resultEnduranceSeconds !== null) {
      resultQuantityKg = resultConsumptionKgPerSecond * resultEnduranceSeconds;
    }

    if (resultEnduranceSeconds === null && resultConsumptionKgPerSecond !== null && resultQuantityKg !== null) {
      if (resultConsumptionKgPerSecond <= 0) {
        alert('Consumption must be greater than zero to calculate endurance.');
        return;
      }
      resultEnduranceSeconds = resultQuantityKg / resultConsumptionKgPerSecond;
    }

    if (resultConsumptionKgPerSecond === null || resultQuantityKg === null || resultEnduranceSeconds === null) {
      alert('Unable to calculate result from provided values.');
      return;
    }

    this.result.set({
      consumption: this.kgPerSecondToConsumption(resultConsumptionKgPerSecond, consumptionUnit, densityKgPerLiter),
      quantity: this.kgToQuantity(resultQuantityKg, quantityUnit, densityKgPerLiter),
      enduranceSeconds: resultEnduranceSeconds,
    });

    this.scrollToResult();
  }

  private parseInputs(): { consumption: number | null; quantity: number | null; enduranceSeconds: number | null; densityKgPerLiter: number } | null {
    const consumption = this.parseNumericField(this.consumptionControl.value, 'Consumption');
    if (consumption === undefined) {
      return null;
    }

    const quantity = this.parseNumericField(this.quantityControl.value, 'Fuel quantity');
    if (quantity === undefined) {
      return null;
    }

    const enduranceSeconds = parseTimeToSeconds(this.enduranceControl.value);
    if (enduranceSeconds === undefined) {
      return null;
    }

    const densityKgPerLiter = this.parseDensity();
    if (densityKgPerLiter === undefined) {
      return null;
    }

    const filledCount = [consumption, quantity, enduranceSeconds].filter((value) => value !== null).length;
    if (filledCount !== 2) {
      alert('Enter exactly two values: consumption, fuel quantity, or endurance.');
      return null;
    }

    return { consumption, quantity, enduranceSeconds, densityKgPerLiter };
  }


  shouldShowDensityInput(): boolean {
    const quantityUnit = this.quantityUnitControl.value;
    const consumptionUnit = this.consumptionUnitControl.value;
    return this.isVolumeQuantityUnit(quantityUnit) !== this.isVolumeConsumptionUnit(consumptionUnit);
  }

  private parseDensity(): number | undefined {
    if (!this.shouldShowDensityInput()) {
      return DEFAULT_FUEL_DENSITY_KG_PER_LITER;
    }

    const normalized = this.densityControl.value.trim();
    const value = Number.parseFloat(normalized);
    if (Number.isNaN(value) || value <= 0) {
      alert('Fuel density must be a valid number greater than zero (kg/L).');
      return undefined;
    }
    return value;
  }

  private parseNumericField(rawValue: unknown, label: string): number | null | undefined {
    if (rawValue === null || rawValue === undefined) {
      return null;
    }

    if (typeof rawValue === 'number') {
      if (Number.isNaN(rawValue) || rawValue < 0) {
        alert(`${label} must be a valid number greater than or equal to zero.`);
        return undefined;
      }
      return rawValue;
    }

    const normalized = String(rawValue).trim();
    if (!normalized) {
      return null;
    }

    const value = Number.parseFloat(normalized);
    if (Number.isNaN(value) || value < 0) {
      alert(`${label} must be a valid number greater than or equal to zero.`);
      return undefined;
    }

    return value;
  }

  private quantityToKg(value: number, unit: FuelQuantityUnit, densityKgPerLiter: number): number {
    if (unit === 'kg') return value;
    return value * densityKgPerLiter;
  }

  private kgToQuantity(valueKg: number, unit: FuelQuantityUnit, densityKgPerLiter: number): number {
    if (unit === 'kg') return valueKg;
    return valueKg / densityKgPerLiter;
  }

  private consumptionToKgPerSecond(value: number, unit: FuelConsumptionUnit, densityKgPerLiter: number): number {
    switch (unit) {
      case 'kgph':
        return value / 3600;
      case 'kgpm':
        return value / 60;
      case 'lph':
        return (value * densityKgPerLiter) / 3600;
      default:
        return (value * densityKgPerLiter) / 60;
    }
  }

  private kgPerSecondToConsumption(valueKgPerSecond: number, unit: FuelConsumptionUnit, densityKgPerLiter: number): number {
    switch (unit) {
      case 'kgph':
        return valueKgPerSecond * 3600;
      case 'kgpm':
        return valueKgPerSecond * 60;
      case 'lph':
        return (valueKgPerSecond * 3600) / densityKgPerLiter;
      default:
        return (valueKgPerSecond * 60) / densityKgPerLiter;
    }
  }

  private isVolumeQuantityUnit(unit: FuelQuantityUnit): boolean {
    return unit === 'liter';
  }

  private isVolumeConsumptionUnit(unit: FuelConsumptionUnit): boolean {
    return unit === 'lph' || unit === 'lpm';
  }

  private quantityUnitLabel(unit: FuelQuantityUnit): string {
    return unit === 'kg' ? 'kg' : 'L';
  }

  private consumptionUnitLabel(unit: FuelConsumptionUnit): string {
    switch (unit) {
      case 'kgph':
        return 'kg/h';
      case 'kgpm':
        return 'kg/min';
      case 'lph':
        return 'L/h';
      default:
        return 'L/min';
    }
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
 * Converts HH:MM:SS text (hours:minutes:seconds) to elapsed seconds.
 * @param value Time text in HH:MM:SS.
 * @returns Total seconds, null for empty input, or undefined for invalid format.
 */
export function parseTimeToSeconds(value: unknown): number | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d+)\s*:\s*([0-5]?\d)\s*:\s*([0-5]?\d)$/);
  if (!match) {
    alert('Endurance must use HH:MM:SS format.');
    return undefined;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const seconds = Number.parseInt(match[3], 10);

  return (hours * 3600) + (minutes * 60) + seconds;
}

/**
 * Formats elapsed seconds to HH:MM:SS.
 * @param secondsTotal Elapsed time in seconds.
 * @returns Time string in HH:MM:SS.
 */
export function formatSecondsToTime(secondsTotal: number): string {
  const rounded = Math.max(0, Math.round(secondsTotal));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Tool metadata used by the application registry.
 */
export const fuelConsumptionQuantityEnduranceTool: ToolDefinition = {
  id: 'fuel-consumption-quantity-endurance',
  name: 'Fuel Consumption / Quantity / Endurance',
  description: 'Solve one missing value from fuel consumption, fuel quantity, and endurance.',
  component: FuelConsumptionQuantityEnduranceComponent,
};
