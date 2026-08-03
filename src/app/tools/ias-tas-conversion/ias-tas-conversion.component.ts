import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import {
  calculateTas,
  densityRatioAtFlightLevel,
  standardPressureAtFlightLevel,
  standardTemperatureAtFlightLevel,
} from './ias-tas-conversion.helper';

export interface IasTasResult {
  tas: number;
  pressureHpa: number;
  densityRatio: number;
}

/** UI component for estimating TAS from IAS, flight level, and OAT. */
@Component({
  selector: 'app-ias-tas-conversion',
  imports: [ReactiveFormsModule],
  templateUrl: './ias-tas-conversion.component.html',
  styleUrls: ['../tool-shared.css', './ias-tas-conversion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IasTasConversionComponent {
  readonly flightLevelControl = new FormControl('', { nonNullable: true });
  readonly oatControl = new FormControl('', { nonNullable: true });
  readonly iasControl = new FormControl('', { nonNullable: true });
  readonly result = signal<IasTasResult | null>(null);
  readonly error = signal('');

  onFlightLevelChange(): void {
    const rawFlightLevel = String(this.flightLevelControl.value).trim();
    const flightLevel = Number(rawFlightLevel);

    if (!rawFlightLevel || !Number.isFinite(flightLevel) || flightLevel < 0 || flightLevel > 650) {
      return;
    }

    const standardOat = standardTemperatureAtFlightLevel(flightLevel);
    this.oatControl.setValue(this.formatTemperature(standardOat));
  }

  calculate(): void {
    const flightLevel = Number(this.flightLevelControl.value);
    const oat = Number(this.oatControl.value);
    const ias = Number(this.iasControl.value);

    if (!String(this.flightLevelControl.value).trim() || !Number.isFinite(flightLevel) || flightLevel < 0 || flightLevel > 650) {
      this.showError('Enter a flight level from 0 to 650.');
      return;
    }
    if (!String(this.oatControl.value).trim() || !Number.isFinite(oat) || oat <= -273.15 || oat > 100) {
      this.showError('Enter a valid OAT above absolute zero and not greater than 100 °C.');
      return;
    }
    if (!String(this.iasControl.value).trim() || !Number.isFinite(ias) || ias <= 0) {
      this.showError('Enter an IAS greater than zero.');
      return;
    }

    try {
      this.error.set('');
      this.result.set({
        tas: calculateTas(ias, flightLevel, oat),
        pressureHpa: standardPressureAtFlightLevel(flightLevel) / 100,
        densityRatio: densityRatioAtFlightLevel(flightLevel, oat),
      });
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Unable to calculate TAS.');
    }
  }

  private formatTemperature(value: number): string {
    return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
  }

  private showError(message: string): void {
    this.result.set(null);
    this.error.set(message);
  }
}

/** Tool metadata for the IAS to TAS conversion calculator. */
export const iasTasConversionTool: ToolDefinition = {
  id: 'ias-tas-conversion',
  name: 'IAS to TAS',
  description: 'Estimate true airspeed from IAS, flight level, and OAT.',
  component: IasTasConversionComponent,
};
