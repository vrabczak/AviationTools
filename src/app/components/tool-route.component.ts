import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { altitudeCorrectionTool } from '../tools/altitude-correction/altitude-correction.component';
import { approachTableTool } from '../tools/approach-table/approach-table.component';
import { coordinatesConversionTool } from '../tools/coordinates-conversion/coordinates-conversion.component';
import { distanceConversionTool } from '../tools/distance-conversion/distance-conversion.component';
import { fuelConversionTool } from '../tools/fuel-conversion/fuel-conversion.component';
import { headCrossWindTool } from '../tools/head-cross-wind/head-cross-wind.component';
import { minimaAltitudeHeightTool } from '../tools/minima-altitude-height/minima-altitude-height.component';
import { speedConversionTool } from '../tools/speed-conversion/speed-conversion.component';
import { trackGroundSpeedTool } from '../tools/track-ground-speed/track-ground-speed.component';
import { turnCalculatorTool } from '../tools/turn-calculator/turn-calculator.component';
import { ToolDefinition } from '../tools/tool-definition';
import { ToolContainerComponent } from './tool-container.component';

/**
 * Ordered collection of all available aviation tools exposed in the UI.
 */
export const tools: ToolDefinition[] = [
  altitudeCorrectionTool,
  approachTableTool,
  headCrossWindTool,
  minimaAltitudeHeightTool,
  trackGroundSpeedTool,
  turnCalculatorTool,
  coordinatesConversionTool,
  distanceConversionTool,
  fuelConversionTool,
  speedConversionTool,
];

const getToolById = (id: string): ToolDefinition | undefined => {
  return tools.find((tool) => tool.id === id);
};

/**
 * Route-aware container that selects a tool based on the current URL.
 */
@Component({
  selector: 'app-tool-route',
  imports: [CommonModule, ToolContainerComponent],
  templateUrl: './tool-route.component.html',
  styleUrls: ['./tool-route.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolRouteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly paramMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  readonly tool = computed(() => {
    const params: ParamMap | null = this.paramMap();
    const fallbackTool = tools[0];
    if (!params) return fallbackTool;
    const toolId = params.get('toolId') ?? fallbackTool?.id ?? '';
    return getToolById(toolId) ?? fallbackTool;
  });
}
