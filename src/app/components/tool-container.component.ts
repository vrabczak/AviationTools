import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ToolDefinition } from '../tools/tool-definition';

/**
 * Renders the active tool component or a loading state when none is selected.
 */
@Component({
  selector: 'app-tool-container',
  imports: [CommonModule],
  templateUrl: './tool-container.component.html',
  styleUrls: ['./tool-container.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolContainerComponent {
  readonly tool = input<ToolDefinition | undefined>();
}
