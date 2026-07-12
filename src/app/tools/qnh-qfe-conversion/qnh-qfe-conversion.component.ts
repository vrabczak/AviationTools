import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import {
  AltitudeUnit,
  altitudeToMeters,
  convertPressure,
  convertQnhQfe,
  PressureType,
  PressureUnit,
} from './qnh-qfe-conversion.helper';

export interface QnhQfeResult {
  type: PressureType;
  hpa: number;
  inhg: number;
}

/** UI component for converting QNH and aerodrome QFE pressure settings. */
@Component({
  selector: 'app-qnh-qfe-conversion',
  imports: [ReactiveFormsModule],
  templateUrl: './qnh-qfe-conversion.component.html',
  styleUrls: ['../tool-shared.css', './qnh-qfe-conversion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QnhQfeConversionComponent {
  readonly pressureTypeControl = new FormControl<PressureType>('qnh', { nonNullable: true });
  readonly pressureUnitControl = new FormControl<PressureUnit>('hpa', { nonNullable: true });
  readonly pressureControl = new FormControl('', { nonNullable: true });
  readonly altitudeUnitControl = new FormControl<AltitudeUnit>('ft', { nonNullable: true });
  readonly altitudeControl = new FormControl('', { nonNullable: true });
  readonly result = signal<QnhQfeResult | null>(null);
  readonly error = signal('');

  readonly outputType = computed<PressureType>(() =>
    this.pressureTypeControl.value === 'qnh' ? 'qfe' : 'qnh'
  );

  convert(): void {
    const pressure = Number(this.pressureControl.value);
    const altitude = Number(this.altitudeControl.value);

    if (!String(this.pressureControl.value).trim() || !Number.isFinite(pressure) || pressure <= 0) {
      this.showError('Enter a valid pressure greater than zero.');
      return;
    }
    if (!String(this.altitudeControl.value).trim() || !Number.isFinite(altitude)) {
      this.showError('Enter a valid airport elevation.');
      return;
    }

    try {
      const pressureHpa = convertPressure(pressure, this.pressureUnitControl.value, 'hpa');
      const elevationMeters = altitudeToMeters(altitude, this.altitudeUnitControl.value);
      const convertedHpa = convertQnhQfe(pressureHpa, this.pressureTypeControl.value, elevationMeters);

      this.error.set('');
      this.result.set({
        type: this.outputType(),
        hpa: convertedHpa,
        inhg: convertPressure(convertedHpa, 'hpa', 'inhg'),
      });
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Unable to convert the pressure setting.');
    }
  }

  private showError(message: string): void {
    this.result.set(null);
    this.error.set(message);
  }
}

/** Tool metadata for the QNH/QFE pressure conversion calculator. */
export const qnhQfeConversionTool: ToolDefinition = {
  id: 'qnh-qfe-conversion',
  name: 'QNH / QFE Conversion',
  description: 'Convert between QNH and QFE using airport elevation.',
  component: QnhQfeConversionComponent,
};
