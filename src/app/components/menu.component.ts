import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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

  readonly selectTool = output<void>();
  readonly toggleTheme = output<void>();
  readonly toggleMenu = output<void>();

  onSelect(): void {
    this.selectTool.emit();
  }
}
