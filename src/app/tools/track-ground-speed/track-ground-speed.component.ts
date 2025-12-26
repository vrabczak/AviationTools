import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import { normalizeDegrees } from '../../utils/angles';

export interface GroundVector {
  groundTrack: number;
  groundSpeed: number;
}

/**
 * UI component that computes aircraft ground track and speed based on wind.
 */
@Component({
  selector: 'app-track-ground-speed',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './track-ground-speed.component.html',
  styleUrls: ['../tool-shared.css', './track-ground-speed.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackGroundSpeedComponent {
  readonly windDirectionControl = new FormControl('', { nonNullable: true });
  readonly windSpeedControl = new FormControl('', { nonNullable: true });
  readonly aircraftHeadingControl = new FormControl('', { nonNullable: true });
  readonly tasControl = new FormControl('', { nonNullable: true });
  readonly result = signal<GroundVector | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  calculate(): void {
    const windDirValue = parseFloat(this.windDirectionControl.value);
    const windSpeedValue = parseFloat(this.windSpeedControl.value);
    const headingValue = parseFloat(this.aircraftHeadingControl.value);
    const tasValue = parseFloat(this.tasControl.value);

    if (Number.isNaN(windDirValue) || Number.isNaN(windSpeedValue) || Number.isNaN(headingValue) || Number.isNaN(tasValue)) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    if (windSpeedValue < 0 || tasValue < 0) {
      alert('Speeds must be zero or greater');
      return;
    }

    if (windDirValue < 0 || windDirValue > 360) {
      alert('Wind Direction must be between 0 and 360');
      return;
    }

    if (headingValue < 0 || headingValue > 360) {
      alert('Aircraft Heading must be between 0 and 360');
      return;
    }

    const normalizedWindDir = normalizeDegrees(windDirValue);
    const normalizedHeading = normalizeDegrees(headingValue);

    this.result.set(this.calculateGroundVector(normalizedHeading, tasValue, normalizedWindDir, windSpeedValue));
    this.scrollToResult();
  }

  calculateGroundVector(
    heading: number,
    tas: number,
    windFromDirection: number,
    windSpeed: number
  ): GroundVector {
    const headingRad = (heading * Math.PI) / 180;
    const windToDirection = normalizeDegrees(windFromDirection + 180);
    const windToRad = (windToDirection * Math.PI) / 180;

    const aircraftVx = tas * Math.sin(headingRad);
    const aircraftVy = tas * Math.cos(headingRad);

    const windVx = windSpeed * Math.sin(windToRad);
    const windVy = windSpeed * Math.cos(windToRad);

    const totalVx = aircraftVx + windVx;
    const totalVy = aircraftVy + windVy;

    const groundSpeed = Math.sqrt(totalVx * totalVx + totalVy * totalVy);
    const groundTrack = normalizeDegrees((Math.atan2(totalVx, totalVy) * 180) / Math.PI);

    return { groundTrack, groundSpeed };
  }

  readonly groundTrackDisplay = computed(() => {
    const current = this.result();
    return current ? `${current.groundTrack.toFixed(0).padStart(3, '0')}` : '-';
  });

  readonly speedChange = computed(() => {
    const current = this.result();
    if (!current) return 0;
    return current.groundSpeed - parseFloat(this.tasControl.value || '0');
  });

  formatSpeedChange(): string {
    return Math.abs(this.speedChange()).toFixed(1);
  }

  readonly changeLabel = computed(() => {
    if (!this.result()) return '';
    return this.speedChange() > 0
      ? 'tailwind component increasing'
      : this.speedChange() < 0
        ? 'headwind component reducing'
        : 'little change to';
  });

  readonly wcaText = computed(() => {
    const current = this.result();
    if (!current) return '';
    let wca = current.groundTrack - parseFloat(this.aircraftHeadingControl.value || '0');
    if (wca > 180) wca -= 360;
    if (wca < -180) wca += 360;
    const wcaDirection = wca > 0 ? 'right' : wca < 0 ? 'left' : 'no';
    return wca !== 0 ? ` Wind Correction Angle: ${Math.abs(wca).toFixed(1)}° ${wcaDirection}.` : '';
  });

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
export const trackGroundSpeedTool: ToolDefinition = {
  id: 'track-ground-speed',
  name: 'Track / Ground Speed',
  description: 'Calculate aircraft track and groundspeed from heading, TAS, and wind',
  component: TrackGroundSpeedComponent,
};
