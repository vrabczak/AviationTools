import { ITool } from '../tools/ITool';
import { ToolRegistry } from '../tools/ToolRegistry';

/**
 * Menu component
 * Displays a list of available tools and handles tool selection
 */
export class Menu {
  private container: HTMLElement;
  private onToolSelect: (tool: ITool) => void;
  private currentTheme: 'light' | 'dark' = 'dark';

  constructor(container: HTMLElement, onToolSelect: (tool: ITool) => void) {
    this.container = container;
    this.onToolSelect = onToolSelect;
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Load theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('aviation-tools-theme') as 'light' | 'dark' | null;
    this.currentTheme = savedTheme || 'dark';
    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    localStorage.setItem('aviation-tools-theme', theme);
  }

  private toggleTheme(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.updateThemeIcon();
  }

  private updateThemeIcon(): void {
    const themeToggle = this.container.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = this.getThemeIcon();
    }
  }

  private getThemeIcon(): string {
    if (this.currentTheme === 'dark') {
      // Sun icon for switching to light mode
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
      </svg>`;
    } else {
      // Moon icon for switching to dark mode
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />
      </svg>`;
    }
  }

  render(): void {
    const tools = ToolRegistry.getAllTools();

    this.container.innerHTML = `
      <div class="menu">
        <div class="menu-header">
          <h1>✈️ Aviation Tools</h1>
          <button class="theme-toggle" aria-label="Toggle theme" title="Toggle light/dark mode">
            ${this.getThemeIcon()}
          </button>
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

    // Theme toggle
    const themeToggle = this.container.querySelector('.theme-toggle');
    themeToggle?.addEventListener('click', () => {
      this.toggleTheme();
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