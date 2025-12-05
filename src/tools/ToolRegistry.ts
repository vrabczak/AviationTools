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

export function getToolById(id: string): ITool | undefined {
  return tools.find((tool) => tool.id === id);
}

export const ToolRegistry = {
  getAllTools: () => tools,
  getToolById,
};
