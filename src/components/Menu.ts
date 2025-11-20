import { ITool } from '../tools/ITool';
import { ToolRegistry } from '../tools/ToolRegistry';

/**
 * Menu component
 * Displays a list of available tools and handles tool selection
 */
export class Menu {
  private container: HTMLElement;
  private onToolSelect: (tool: ITool) => void;

  constructor(container: HTMLElement, onToolSelect: (tool: ITool) => void) {
    this.container = container;
    this.onToolSelect = onToolSelect;
  }

  render(): void {
    const tools = ToolRegistry.getAllTools();

    this.container.innerHTML = `
      <div class="menu">
        <div class="menu-header">
          <h1>✈️ Aviation Tools</h1>
          <button id="menu-toggle" class="menu-toggle" aria-label="Toggle menu">
            <span class="hamburger"></span>
          </button>
        </div>
        <nav class="menu-nav">
          <div class="menu-section">
            <h3>Calculators</h3>
            <ul class="tool-list">
              ${tools.map(tool => `
                <li>
                  <button 
                    class="tool-button" 
                    data-tool-id="${tool.id}"
                    title="${tool.description}"
                  >
                    <span class="tool-name">${tool.name}</span>
                    <span class="tool-desc">${tool.description}</span>
                  </button>
                </li>
              `).join('')}
            </ul>
          </div>
        </nav>
        <div class="menu-footer">
          <p>Aviation Tools v1.0</p>
          <p><small>Offline-capable PWA</small></p>
        </div>
      </div>
    `;

    this.attachEventListeners();
    
    // Select first tool by default
    if (tools.length > 0) {
      this.selectTool(tools[0].id);
    }
  }

  private attachEventListeners(): void {
    // Tool selection
    const toolButtons = this.container.querySelectorAll('.tool-button');
    toolButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const toolId = (e.currentTarget as HTMLElement).getAttribute('data-tool-id');
        if (toolId) {
          this.selectTool(toolId);
        }
      });
    });

    // Mobile menu toggle
    const menuToggle = this.container.querySelector('#menu-toggle');
    const menu = this.container.querySelector('.menu');
    
    menuToggle?.addEventListener('click', () => {
      menu?.classList.toggle('menu-open');
    });
  }

  private selectTool(toolId: string): void {
    const tool = ToolRegistry.getToolById(toolId);
    if (!tool) return;

    // Update active state
    const buttons = this.container.querySelectorAll('.tool-button');
    buttons.forEach(button => {
      if (button.getAttribute('data-tool-id') === toolId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    // Close mobile menu after selection
    const menu = this.container.querySelector('.menu');
    menu?.classList.remove('menu-open');

    // Notify parent
    this.onToolSelect(tool);
  }
}