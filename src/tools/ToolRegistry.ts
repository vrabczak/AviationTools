import { ITool } from './ITool';
import { altitudeCorrectionTool } from './AltitudeCorrection';
import { turnCalculatorTool } from './TurnCalculator';
import { headCrossWindTool } from './HeadCrossWind';
import { trackGroundSpeedTool } from './TrackGroundSpeed';
import { approachTableTool } from './ApproachTable';
import { coordinatesConversionTool } from './CoordinatesConversion';
import { distanceConversionTool } from './DistanceConversion';
import { fuelConversionTool } from './FuelConversion';
import { speedConversionTool } from './SpeedConversion';
import { minimaAltitudeHeightTool } from './MinimaAltitudeHeight';

/**
 * Ordered collection of all available aviation tools exposed in the UI.
 * Maintain this list to control menu ordering and to register new calculators.
 */
export const tools: ITool[] = [
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

/**
 * Look up a tool definition by its stable identifier.
 *
 * @param id - The unique tool id used in routing and menu selection.
 * @returns The matching tool definition or `undefined` if no tool exists for the id.
 */
export function getToolById(id: string): ITool | undefined {
  return tools.find((tool) => tool.id === id);
}

/**
 * Convenience wrapper exposing registry helpers for consistency across imports.
 */
export const ToolRegistry = {
  getAllTools: () => tools,
  getToolById,
};
