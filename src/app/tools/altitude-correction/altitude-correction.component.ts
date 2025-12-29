import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';

export interface AltitudeCorrectionResult {
  correctedAltitude: number;
  correction: number;
}

/**
 * UI component that computes altitude corrections for non-ISA temperatures.
 */
@Component({
  selector: 'app-altitude-correction',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './altitude-correction.component.html',
  styleUrls: ['../tool-shared.css', './altitude-correction.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltitudeCorrectionComponent {
  readonly decisionAltControl = new FormControl('', { nonNullable: true });
  readonly airportAltControl = new FormControl('', { nonNullable: true });
  readonly temperatureControl = new FormControl('', { nonNullable: true });
  readonly result = signal<AltitudeCorrectionResult | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly interpretation = computed(() => {
    const current = this.result();
    if (!current) return '';
    if (current.correction > 0) {
      return `Cold temperature! You will be LOWER than indicated altitude. Add ${Math.round(current.correction)} ft to your decision altitude to maintain safe terrain clearance.`;
    }
    if (current.correction < 0) {
      return `Warm temperature. You will be HIGHER than indicated altitude by ${Math.abs(Math.round(current.correction))} ft. Correction usually not applied for warmer temperatures.`;
    }
    return 'Temperature matches ISA. No correction needed.';
  });

  formatFeet(value: number): string {
    return Math.round(value).toLocaleString();
  }

  formatCorrection(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${Math.round(value).toLocaleString()}`;
  }

  calculateTemperatureCorrection(
    decisionAltitude: number,
    airportAltitude: number,
    temperature: number
  ): AltitudeCorrectionResult {
    const heightAboveAirport = decisionAltitude - airportAltitude;
    const isaTemp = 15 - (airportAltitude / 1000) * 2;
    const actualTempKelvin = temperature + 273;
    const correction = (heightAboveAirport * (isaTemp - temperature)) / actualTempKelvin;
    const correctedAltitude = decisionAltitude + correction;

    return { correctedAltitude, correction };
  }

  calculate(): void {
    const decisionValue = parseFloat(this.decisionAltControl.value);
    const airportValue = parseFloat(this.airportAltControl.value);
    const temperatureValue = parseFloat(this.temperatureControl.value);

    if (Number.isNaN(decisionValue) || Number.isNaN(airportValue) || Number.isNaN(temperatureValue)) {
      alert('Please fill in all fields with valid numbers.');
      return;
    }

    if (airportValue >= decisionValue) {
      alert('Airport elevation must be lower than DA/MDA.');
      return;
    }

    this.result.set(this.calculateTemperatureCorrection(decisionValue, airportValue, temperatureValue));
    this.scrollToResult();
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
export const altitudeCorrectionTool: ToolDefinition = {
  id: 'altitude-correction',
  name: 'Altitude Correction',
  description: 'Calculate temperature-corrected altitude for approach procedures.',
  component: AltitudeCorrectionComponent,
};
