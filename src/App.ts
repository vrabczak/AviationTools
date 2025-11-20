import { Menu } from './components/Menu';
import { ToolContainer } from './components/ToolContainer';
import { ITool } from './tools/ITool';

/**
 * Main Application Controller
 * Manages the overall app state and coordinates between components
 */
export class App {
  private menu: Menu;
  private toolContainer: ToolContainer;

  constructor() {
    const menuElement = document.getElementById('menu-container');
    const toolElement = document.getElementById('tool-container');

    if (!menuElement || !toolElement) {
      throw new Error('Required DOM elements not found');
    }

    this.toolContainer = new ToolContainer(toolElement);
    this.menu = new Menu(menuElement, (tool: ITool) => this.onToolSelected(tool));
  }

  /**
   * Initialize and start the application
   */
  init(): void {
    console.log('Aviation Tools App initializing...');
    this.menu.render();
    console.log('Aviation Tools App ready!');
  }

  /**
   * Handle tool selection from menu
   */
  private onToolSelected(tool: ITool): void {
    console.log(`Tool selected: ${tool.name}`);
    this.toolContainer.showTool(tool);
  }
}