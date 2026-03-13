import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';

export type CruiseSpeedUnit = 'kt' | 'kmh';
export type RouteDistanceUnit = 'nm' | 'km';

const SPEED_TO_KT: Record<CruiseSpeedUnit, number> = {
  kt: 1,
  kmh: 1 / 1.852,
};

const DISTANCE_TO_NM: Record<RouteDistanceUnit, number> = {
  nm: 1,
  km: 1 / 1.852,
};

interface SdtResult {
  speed: number;
  distance: number;
  timeSeconds: number;
}

/**
 * Calculates one missing value between speed, distance, and time.
 */
@Component({
  selector: 'app-speed-distance-time',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './speed-distance-time.component.html',
  styleUrls: ['../tool-shared.css', './speed-distance-time.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedDistanceTimeComponent {
  private readonly injector = inject(Injector);

  readonly speedUnitControl = new FormControl<CruiseSpeedUnit>('kt', { nonNullable: true });
  readonly distanceUnitControl = new FormControl<RouteDistanceUnit>('nm', { nonNullable: true });

  readonly speedControl = new FormControl('', { nonNullable: true });
  readonly distanceControl = new FormControl('', { nonNullable: true });
  readonly timeControl = new FormControl('', { nonNullable: true });

  readonly result = signal<SdtResult | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly speedDisplay = computed(() => {
    const current = this.result();
    return current ? `${current.speed.toFixed(0)} ${this.unitLabelForSpeed(this.speedUnitControl.value)}` : '-';
  });

  readonly distanceDisplay = computed(() => {
    const current = this.result();
    return current ? `${current.distance.toFixed(2)} ${this.unitLabelForDistance(this.distanceUnitControl.value)}` : '-';
  });

  readonly timeDisplay = computed(() => {
    const current = this.result();
    return current ? formatSecondsToTime(current.timeSeconds) : '-';
  });

  calculate(): void {
    const parsed = this.parseInputs();
    if (!parsed) {
      return;
    }

    const speedUnit = this.speedUnitControl.value;
    const distanceUnit = this.distanceUnitControl.value;

    const speedKt = parsed.speed === null ? null : parsed.speed * SPEED_TO_KT[speedUnit];
    const distanceNm = parsed.distance === null ? null : parsed.distance * DISTANCE_TO_NM[distanceUnit];

    let resultSpeedKt = speedKt;
    let resultDistanceNm = distanceNm;
    let resultTimeSeconds = parsed.timeSeconds;

    if (resultSpeedKt === null && resultDistanceNm !== null && resultTimeSeconds !== null) {
      const hours = resultTimeSeconds / 3600;
      if (hours <= 0) {
        alert('Time must be greater than 00:00:00 to calculate speed.');
        return;
      }
      resultSpeedKt = resultDistanceNm / hours;
    }

    if (resultDistanceNm === null && resultSpeedKt !== null && resultTimeSeconds !== null) {
      const hours = resultTimeSeconds / 3600;
      resultDistanceNm = resultSpeedKt * hours;
    }

    if (resultTimeSeconds === null && resultSpeedKt !== null && resultDistanceNm !== null) {
      if (resultSpeedKt <= 0) {
        alert('Speed must be greater than zero to calculate time.');
        return;
      }
      resultTimeSeconds = (resultDistanceNm / resultSpeedKt) * 3600;
    }

    if (resultSpeedKt === null || resultDistanceNm === null || resultTimeSeconds === null) {
      alert('Unable to calculate result from provided values.');
      return;
    }

    this.result.set({
      speed: resultSpeedKt / SPEED_TO_KT[speedUnit],
      distance: resultDistanceNm / DISTANCE_TO_NM[distanceUnit],
      timeSeconds: resultTimeSeconds,
    });

    this.scrollToResult();
  }

  private parseInputs(): { speed: number | null; distance: number | null; timeSeconds: number | null } | null {
    const speed = this.parseNumericField(this.speedControl.value, 'Speed');
    if (speed === undefined) {
      return null;
    }

    const distance = this.parseNumericField(this.distanceControl.value, 'Distance');
    if (distance === undefined) {
      return null;
    }

    const timeSeconds = parseTimeToSeconds(this.timeControl.value);

    if (timeSeconds === undefined) {
      return null;
    }

    const filledCount = [speed, distance, timeSeconds].filter((value) => value !== null).length;

    if (filledCount !== 2) {
      alert('Enter exactly two values: speed, distance, or time.');
      return null;
    }

    return { speed, distance, timeSeconds };
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

  private unitLabelForSpeed(unit: CruiseSpeedUnit): string {
    if (unit === 'kt') return 'kt';
    return 'km/h';
  }

  private unitLabelForDistance(unit: RouteDistanceUnit): string {
    if (unit === 'nm') return 'NM';
    return 'km';
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
 * Converts HH:MM:SS text to elapsed seconds.
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
    alert('Time must use HH:MM:SS format.');
    return undefined;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const seconds = Number.parseInt(match[3], 10);

  return (hours * 3600) + (minutes * 60) + seconds;
}

/**
 * Formats elapsed seconds to HH:MM:SS.
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
export const speedDistanceTimeTool: ToolDefinition = {
  id: 'speed-distance-time',
  name: 'Speed / Distance / Time',
  description: 'Solve one missing value from speed, distance, and time.',
  component: SpeedDistanceTimeComponent,
};
