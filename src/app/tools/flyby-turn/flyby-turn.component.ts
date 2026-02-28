import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import { computeTurnAnticipationDistance } from './flyby-turn.helper';

export type FlybyDistanceUnit = 'km' | 'nm';

interface FlybyTurnResult {
  turnAngleDeg: number;
  anticipationDistance: number;
  turnRadius: number | null;
  unit: FlybyDistanceUnit;
}

const METERS_PER_UNIT: Record<FlybyDistanceUnit, number> = {
  km: 1000,
  nm: 1852,
};

/**
 * UI component for calculating fly-by turn lead distance and turn radius.
 */
@Component({
  selector: 'app-flyby-turn',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flyby-turn.component.html',
  styleUrls: ['../tool-shared.css', './flyby-turn.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlybyTurnComponent {
  private readonly injector = inject(Injector);

  readonly inboundTrackControl = new FormControl('', { nonNullable: true });
  readonly outboundTrackControl = new FormControl('', { nonNullable: true });
  readonly bankAngleControl = new FormControl('', { nonNullable: true });
  readonly groundSpeedControl = new FormControl('', { nonNullable: true });
  readonly unitControl = new FormControl<FlybyDistanceUnit>('nm', { nonNullable: true });
  readonly result = signal<FlybyTurnResult | null>(null);
  readonly errorMessage = signal<string | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly unitLabel = computed(() => {
    const unit = this.result()?.unit ?? this.unitControl.value;
    return unit === 'nm' ? 'NM' : 'km';
  });

  readonly resultSummary = computed(() => {
    const currentResult = this.result();
    if (!currentResult) return '';
    if (currentResult.turnAngleDeg < 0.01) {
      return 'No fly-by lead is required for a 0 deg track change.';
    }
    return `Track change: ${currentResult.turnAngleDeg.toFixed(1)} deg.`;
  });

  calculate(): void {
    this.errorMessage.set(null);

    const inboundTrack = parseFloat(this.inboundTrackControl.value);
    const outboundTrack = parseFloat(this.outboundTrackControl.value);
    const bankAngle = parseFloat(this.bankAngleControl.value);
    const groundSpeed = parseFloat(this.groundSpeedControl.value);

    const validationError = this.validateInputs(inboundTrack, outboundTrack, bankAngle, groundSpeed);
    if (validationError) {
      this.result.set(null);
      this.errorMessage.set(validationError);
      return;
    }

    try {
      const rawResult = computeTurnAnticipationDistance(bankAngle, groundSpeed, inboundTrack, outboundTrack);
      const unit = this.unitControl.value;
      const metersPerUnit = METERS_PER_UNIT[unit];

      this.result.set({
        turnAngleDeg: rawResult.turnAngleDeg,
        anticipationDistance: rawResult.leadDistanceM / metersPerUnit,
        turnRadius: Number.isFinite(rawResult.turnRadiusM) ? rawResult.turnRadiusM / metersPerUnit : null,
        unit,
      });
      this.scheduleScrollToResult();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Unable to compute fly-by turn values. Please check your inputs.';
      this.result.set(null);
      this.errorMessage.set(message);
    }
  }

  formatDistance(value: number): string {
    if (value >= 100) return value.toFixed(2);
    if (value >= 10) return value.toFixed(3);
    return value.toFixed(4);
  }

  private validateInputs(
    inboundTrack: number,
    outboundTrack: number,
    bankAngle: number,
    groundSpeed: number
  ): string | null {
    if (
      Number.isNaN(inboundTrack)
      || Number.isNaN(outboundTrack)
      || Number.isNaN(bankAngle)
      || Number.isNaN(groundSpeed)
    ) {
      return 'Enter valid numeric values for all fields.';
    }

    if (inboundTrack < 0 || inboundTrack > 360 || outboundTrack < 0 || outboundTrack > 360) {
      return 'Inbound and outbound track must be between 0 and 360 deg.';
    }

    if (bankAngle <= 0 || bankAngle >= 90) {
      return 'Bank angle must be greater than 0 deg and less than 90 deg.';
    }

    if (groundSpeed <= 0) {
      return 'Ground speed must be greater than 0 kt.';
    }

    return null;
  }

  private scheduleScrollToResult(): void {
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
export const flybyTurnTool: ToolDefinition = {
  id: 'flyby-turn',
  name: 'Fly-By Turn',
  description: 'Compute fly-by turn anticipation distance and turn radius from track change.',
  component: FlybyTurnComponent,
};
