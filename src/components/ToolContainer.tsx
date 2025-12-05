import { ITool } from '../tools/ITool';

/**
 * Tool Container component
 * Manages the display area for the currently active tool
 */
export class ToolContainer {
  private container: HTMLElement;
  private currentTool: ITool | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Display a tool in the container
   */
  showTool(tool: ITool): void {
    // Clean up previous tool
    if (this.currentTool) {
      this.currentTool.destroy();
    }

    // Clear container
    this.container.innerHTML = '';

    // Render new tool
    this.currentTool = tool;
    tool.render(this.container);
  }

  /**
   * Clear the container
   */
  clear(): void {
    if (this.currentTool) {
      this.currentTool.destroy();
      this.currentTool = null;
    }
    this.container.innerHTML = '';
  }
}