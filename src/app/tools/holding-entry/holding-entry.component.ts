import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToolDefinition } from '../tool-definition';
import {
  determineHoldingEntryProcedure,
  HoldingEntryProcedure,
  HoldingTurnDirection,
  normalizeCourse,
} from './holding-entry.helper';

interface Point {
  x: number;
  y: number;
}

interface EntryDiagramModel {
  holdPath: string;
  inboundLine: string;
  outboundLine: string;
  entryLine: string;
  procedureLine: string;
  teardropLine: string;
  northArrow: string;
}

/**
 * Holding pattern entry selection tool with north-up graphical guidance.
 */
@Component({
  selector: 'app-holding-entry',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './holding-entry.component.html',
  styleUrls: ['../tool-shared.css', './holding-entry.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoldingEntryComponent {
  readonly holdInboundCourseControl = new FormControl('', { nonNullable: true });
  readonly patternDirectionControl = new FormControl<HoldingTurnDirection>('right', { nonNullable: true });
  readonly entryCourseControl = new FormControl('', { nonNullable: true });

  readonly errorMessage = signal<string | null>(null);
  readonly procedure = signal<HoldingEntryProcedure | null>(null);
  readonly inboundCourse = signal<number | null>(null);
  readonly entryCourse = signal<number | null>(null);

  readonly diagram = computed<EntryDiagramModel | null>(() => {
    const inbound = this.inboundCourse();
    const entry = this.entryCourse();
    const procedure = this.procedure();
    if (inbound === null || entry === null || !procedure) {
      return null;
    }

    const direction = this.patternDirectionControl.value;
    const outbound = normalizeCourse(inbound + 180);

    const fix: Point = { x: 160, y: 160 };
    const legLength = 85;
    const width = 50;

    const inboundStart = this.projectFromHeading(fix, normalizeCourse(inbound + 180), legLength);
    const outboundEnd = this.projectFromHeading(fix, outbound, legLength);
    const sideHeading = normalizeCourse(inbound + (direction === 'right' ? 90 : -90));
    const outboundOuter = this.projectFromHeading(outboundEnd, sideHeading, width);

    const holdPath = [
      `M ${fix.x} ${fix.y}`,
      `L ${outboundEnd.x} ${outboundEnd.y}`,
      `Q ${outboundOuter.x} ${outboundOuter.y} ${inboundStart.x} ${inboundStart.y}`,
      `L ${fix.x} ${fix.y}`,
    ].join(' ');

    const inboundLine = this.line(inboundStart, fix);
    const outboundLine = this.line(fix, outboundEnd);

    const entryStart = this.projectFromHeading(fix, normalizeCourse(entry + 180), 120);
    const entryLine = this.line(entryStart, fix);

    const teardropHeading = normalizeCourse(outbound + (direction === 'right' ? -30 : 30));
    const teardropEnd = this.projectFromHeading(fix, teardropHeading, 75);

    const procedureLine = procedure === 'Teardrop'
      ? this.line(fix, teardropEnd)
      : procedure === 'Parallel'
        ? this.line(fix, outboundEnd)
        : this.line(fix, outboundOuter);

    const teardropLine = this.line(fix, teardropEnd);
    const northArrow = this.line({ x: 280, y: 45 }, { x: 280, y: 15 });

    return {
      holdPath,
      inboundLine,
      outboundLine,
      entryLine,
      procedureLine,
      teardropLine,
      northArrow,
    };
  });

  calculateEntry(): void {
    this.errorMessage.set(null);

    const inboundValue = parseFloat(this.holdInboundCourseControl.value);
    const entryValue = parseFloat(this.entryCourseControl.value);

    if (Number.isNaN(inboundValue) || Number.isNaN(entryValue)) {
      this.errorMessage.set('Enter valid numeric courses for inbound and entry track.');
      this.procedure.set(null);
      this.inboundCourse.set(null);
      this.entryCourse.set(null);
      return;
    }

    if (inboundValue < 0 || inboundValue > 360 || entryValue < 0 || entryValue > 360) {
      this.errorMessage.set('Courses must be between 0 and 360 deg.');
      this.procedure.set(null);
      this.inboundCourse.set(null);
      this.entryCourse.set(null);
      return;
    }

    const inbound = normalizeCourse(inboundValue);
    const entry = normalizeCourse(entryValue);
    const direction = this.patternDirectionControl.value;

    const procedure = determineHoldingEntryProcedure(inbound, direction, entry);

    this.inboundCourse.set(inbound);
    this.entryCourse.set(entry);
    this.procedure.set(procedure);
  }

  private projectFromHeading(origin: Point, headingDeg: number, distancePx: number): Point {
    const angleRad = (headingDeg * Math.PI) / 180;
    return {
      x: Number((origin.x + Math.sin(angleRad) * distancePx).toFixed(1)),
      y: Number((origin.y - Math.cos(angleRad) * distancePx).toFixed(1)),
    };
  }

  private line(from: Point, to: Point): string {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
}

/**
 * Tool metadata used by the application registry.
 */
export const holdingEntryTool: ToolDefinition = {
  id: 'holding-entry',
  name: 'Holding Entry',
  description: 'Determine direct, parallel, or teardrop entry for a published hold.',
  component: HoldingEntryComponent,
};
