import { ITool } from './ITool';
import { AltitudeCorrection } from './AltitudeCorrection';
import { TurnCalculator } from './TurnCalculator';
import { HeadCrossWind } from './HeadCrossWind';
import { TrackGroundSpeed } from './TrackGroundSpeed';
import { ApproachTable } from './ApproachTable';
import { CoordinatesConversion } from './CoordinatesConversion';
import { DistanceConversion } from './DistanceConversion';
import { FuelConversion } from './FuelConversion';
import { SpeedConversion } from './SpeedConversion';

/**
 * Central registry for all aviation tools
 * Add new tools here to make them available in the app
 */
export class ToolRegistry {
  private static tools: ITool[] = [
    new AltitudeCorrection(),
    new TurnCalculator(),
    new HeadCrossWind(),
    new TrackGroundSpeed(),
    new ApproachTable(),
    new CoordinatesConversion(),
    new DistanceConversion(),
    new FuelConversion(),
    new SpeedConversion(),
  ];

  /**
   * Get all registered tools
   */
  static getAllTools(): ITool[] {
    return this.tools;
  }

  /**
   * Get a tool by its ID
   */
  static getToolById(id: string): ITool | undefined {
    return this.tools.find(tool => tool.id === id);
  }

  /**
   * Register a new tool dynamically
   */
  static registerTool(tool: ITool): void {
    if (!this.tools.find(t => t.id === tool.id)) {
      this.tools.push(tool);
    }
  }
}