import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ToolDefinition } from '../tools/tool-definition';

/**
 * Application side menu listing available tools and theme/menu toggles.
 */
@Component({
  selector: 'app-menu',
  imports: [CommonModule, NgOptimizedImage, RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  readonly tools = input<ToolDefinition[]>([]);
  readonly theme = input<'light' | 'dark'>('dark');
  readonly isOpen = input(false);

  /**
   * Hardcoded submenu assignment. Update these arrays when adding or moving tools.
   */
  private readonly navigationToolIds: readonly string[] = [
    'minima-altitude-height',
    'altitude-correction',
    'approach-table',
    'flyby-turn',
    'turn-calculator',
    'head-cross-wind',
    'track-ground-speed',
  ];
  private readonly conversionToolIds: readonly string[] = [
    'coordinates-conversion',
    'distance-conversion',
    'fuel-conversion',
    'speed-conversion',
  ];

  readonly isNavigationExpanded = signal(true);
  readonly isConversionExpanded = signal(false);
  readonly navigationTools = computed(() => this.getToolsByIds(this.navigationToolIds));
  readonly conversionTools = computed(() => this.getToolsByIds(this.conversionToolIds));

  readonly selectTool = output<void>();
  readonly toggleTheme = output<void>();
  readonly toggleMenu = output<void>();

  onSelect(): void {
    this.selectTool.emit();
  }

  toggleNavigation(): void {
    this.isNavigationExpanded.update((expanded) => !expanded);
  }

  toggleConversion(): void {
    this.isConversionExpanded.update((expanded) => !expanded);
  }

  private getToolsByIds(ids: readonly string[]): ToolDefinition[] {
    const toolMap = new Map(this.tools().map((tool) => [tool.id, tool]));
    return ids.map((id) => toolMap.get(id)).filter((tool): tool is ToolDefinition => tool !== undefined);
  }
}
