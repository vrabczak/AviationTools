import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';

export interface MinimaResult {
  decisionAltitude: number;
  decisionHeight: number;
  usesAircraftMinima: boolean;
  aircraftAdjustment: number;
}

/**
 * Calculates decision altitude/height by combining OCA/OCH, aircraft minima, and operator margin.
 *
 * @param oca - Obstacle Clearance Altitude in feet.
 * @param och - Obstacle Clearance Height in feet.
 * @param aircraftMinima - Aircraft-specific minima in feet.
 * @param operatorMargin - Additional operator-required margin in feet.
 * @returns Decision altitude/height and metadata on applied adjustments.
 */
export function calculateMinima(
  oca: number,
  och: number,
  aircraftMinima: number,
  operatorMargin: number
): MinimaResult {
  const usesAircraftMinima = och < aircraftMinima;
  const aircraftAdjustment = usesAircraftMinima ? aircraftMinima - och : 0;
  const decisionAltitude = oca + aircraftAdjustment + operatorMargin;
  const decisionHeight = (usesAircraftMinima ? aircraftMinima : och) + operatorMargin;

  return {
    decisionAltitude,
    decisionHeight,
    usesAircraftMinima,
    aircraftAdjustment,
  };
}

/**
 * UI component for deriving DA/MDA and DH/MDH values from published minima and operator margins.
 */
@Component({
  selector: 'app-minima-altitude-height',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './minima-altitude-height.component.html',
  styleUrls: ['../tool-shared.css', './minima-altitude-height.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinimaAltitudeHeightComponent {
  readonly ocaControl = new FormControl('', { nonNullable: true });
  readonly ochControl = new FormControl('', { nonNullable: true });
  readonly aircraftMinimaControl = new FormControl('', { nonNullable: true });
  readonly operatorMarginControl = new FormControl('0', { nonNullable: true });
  readonly result = signal<MinimaResult | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly noteText = computed(() => {
    const current = this.result();
    if (!current) return '';
    return `${current.usesAircraftMinima
      ? `OCH is below the aircraft minima by ${Math.round(current.aircraftAdjustment)} ft. Added the difference to DA/MDA and set DH/MDH to the aircraft minima before applying the operator margin.`
      : 'Used published OCA/OCH and applied the operator margin.'} Always crosscheck with manual calculations!`;
  });

  formatMinimaValue(value: number): string {
    return Math.round(value).toLocaleString('en-US');
  }

  calculate(): void {
    const values = [
      this.ocaControl.value,
      this.ochControl.value,
      this.aircraftMinimaControl.value,
      this.operatorMarginControl.value,
    ].map((value) => parseFloat(value));
    if (values.some((value) => Number.isNaN(value))) {
      alert('Please fill in all fields with valid numbers.');
      return;
    }
    const [ocaNum, ochNum, aircraftNum, marginNum] = values;
    if (ochNum < 0 || aircraftNum < 0 || marginNum < 0) {
      alert('Values cannot be negative.');
      return;
    }

    this.result.set(calculateMinima(ocaNum, ochNum, aircraftNum, marginNum));
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
export const minimaAltitudeHeightTool: ToolDefinition = {
  id: 'minima',
  name: 'DA/MDA DH/MDH',
  description: 'Calculate DA/MDA and DH/MDH using OCA/OCH',
  component: MinimaAltitudeHeightComponent,
};
