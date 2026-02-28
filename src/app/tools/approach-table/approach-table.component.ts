import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';

export interface ApproachRow {
  distanceNM: number;
  distanceKM: string;
  altitudeAbove: number;
  heightAbove: number;
}

export type AltitudeUnit = 'ft' | 'm';
export type DistanceUnit = 'NM' | 'km';

const FEET_PER_METER = 3.28084;

/**
 * UI component that generates an approach table for a glide slope and target altitude.
 */
@Component({
  selector: 'app-approach-table',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './approach-table.component.html',
  styleUrls: ['../tool-shared.css', './approach-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproachTableComponent {
  private readonly injector = inject(Injector);

  readonly targetAltitudeControl = new FormControl('', { nonNullable: true });
  readonly slopeAngleControl = new FormControl('3', { nonNullable: true });
  readonly groundSpeedControl = new FormControl('', { nonNullable: true });
  readonly altitudeUnitControl = new FormControl<AltitudeUnit>('ft', { nonNullable: true });
  readonly distanceUnitControl = new FormControl<DistanceUnit>('NM', { nonNullable: true });
  readonly rows = signal<ApproachRow[] | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly targetAltitudeFt = computed(() => {
    const val = parseFloat(this.targetAltitudeControl.value);
    if (Number.isNaN(val)) return null;
    return this.altitudeUnitControl.value === 'm' ? val * FEET_PER_METER : val;
  });

  readonly verticalSpeedText = computed(() => {
    if (!this.rows()) return null;
    const slope = parseFloat(this.slopeAngleControl.value);
    const gs = parseFloat(this.groundSpeedControl.value);
    if (Number.isNaN(slope) || Number.isNaN(gs) || gs <= 0) return null;
    const vsFtMin = gs * Math.tan((slope * Math.PI) / 180) * 101.27;
    if (this.altitudeUnitControl.value === 'm') {
      return `Target Vertical Speed: ${Math.round(vsFtMin / FEET_PER_METER)} m/min`;
    }
    return `Target Vertical Speed: ${Math.round(vsFtMin)} ft/min`;
  });

  readonly slopeAngleValue = computed(() => {
    const slope = parseFloat(this.slopeAngleControl.value);
    return Number.isNaN(slope) ? 0 : slope;
  });

  formatAltitudeValue(valueFt: number): string {
    return this.formatAltitude(valueFt, this.altitudeUnitControl.value);
  }

  formatTargetAltitudeValue(): string {
    const altitudeFt = this.targetAltitudeFt();
    if (altitudeFt === null) return '-';
    const converted = this.altitudeUnitControl.value === 'm' ? altitudeFt / FEET_PER_METER : altitudeFt;
    return `${Math.round(converted).toLocaleString()} ${this.altitudeUnitControl.value}`;
  }

  calculateApproachTable(
    targetAltitude: number,
    slopeAngle: number,
    distanceUnit: DistanceUnit,
  ): ApproachRow[] {
    const NM_TO_FEET = 6076.12;
    const NM_TO_KM = 1.852;
    const results: ApproachRow[] = [];

    if (distanceUnit === 'km') {
      for (let distanceKM = 1; distanceKM <= 20; distanceKM++) {
        const distanceNM = distanceKM / NM_TO_KM;
        const distanceFeet = distanceNM * NM_TO_FEET;
        const slopeRadians = (slopeAngle * Math.PI) / 180;
        const heightAbove = distanceFeet * Math.tan(slopeRadians);
        const altitudeAbove = targetAltitude + heightAbove;

        results.push({
          distanceNM,
          distanceKM: `${distanceKM}`,
          altitudeAbove,
          heightAbove,
        });
      }

      return results;
    }

    for (let distanceNM = 1; distanceNM <= 10; distanceNM++) {
      const distanceFeet = distanceNM * NM_TO_FEET;
      const distanceKM = (distanceNM * NM_TO_KM).toFixed(1);
      const slopeRadians = (slopeAngle * Math.PI) / 180;
      const heightAbove = distanceFeet * Math.tan(slopeRadians);
      const altitudeAbove = targetAltitude + heightAbove;

      results.push({
        distanceNM,
        distanceKM,
        altitudeAbove,
        heightAbove,
      });
    }

    return results;
  }

  calculate(): void {
    const slope = parseFloat(this.slopeAngleControl.value);
    const altitudeFt = this.targetAltitudeFt();
    if (altitudeFt === null) {
      alert('Please enter a valid Target Altitude.');
      return;
    }
    if (Number.isNaN(slope) || slope < 0 || slope > 60) {
      alert('Please enter a valid slope angle (0-60°).');
      return;
    }
    this.rows.set(this.calculateApproachTable(altitudeFt, slope, this.distanceUnitControl.value));
    this.scrollToResult();
  }

  private formatAltitude(valueFt: number, unit: AltitudeUnit): string {
    const converted = unit === 'm' ? valueFt / FEET_PER_METER : valueFt;
    return Math.round(converted).toLocaleString();
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
export const approachTableTool: ToolDefinition = {
  id: 'approach-table',
  name: 'Approach Table',
  description: 'Generate approach table with distances, altitudes, and heights above Target Altitude.',
  component: ApproachTableComponent,
};
