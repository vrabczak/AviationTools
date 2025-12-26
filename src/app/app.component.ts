import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { MenuComponent } from './components/menu.component';
import { RouterOutlet } from '@angular/router';
import { ToolDefinition } from './tools/tool-definition';
import { tools } from './components/tool-route.component';

/**
 * Root application component managing theme, menu state, and active tool selection.
 */
@Component({
  selector: 'app-root',
  imports: [MenuComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly tools: ToolDefinition[] = tools;
  readonly theme = signal<'light' | 'dark'>('dark');
  readonly isMenuOpen = signal(false);

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (typeof window !== 'undefined') {
      const updateAppHeight = (): void => {
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        this.document.documentElement.style.setProperty('--app-height', `${Math.round(viewportHeight)}px`);
      };

      updateAppHeight();
      window.addEventListener('resize', updateAppHeight);
      window.visualViewport?.addEventListener('resize', updateAppHeight);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', updateAppHeight);
        window.visualViewport?.removeEventListener('resize', updateAppHeight);
      });

      const saved = window.localStorage.getItem('aviation-tools-theme');
      if (saved === 'light' || saved === 'dark') {
        this.theme.set(saved);
      }
      this.isMenuOpen.set(window.innerWidth <= 600);
    }
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this.theme());
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('aviation-tools-theme', this.theme());
      }
    });
  }

  onSelectTool(): void {
    this.isMenuOpen.set(false);
  }

  toggleTheme(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }
}
