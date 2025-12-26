import { Type } from '@angular/core';

/**
 * Metadata describing an aviation tool component.
 */
export interface ToolDefinition {
  /** Unique identifier for the tool. */
  id: string;
  /** Display name shown in the menu. */
  name: string;
  /** Short description for the tool list. */
  description: string;
  /** Angular component used to render the tool UI. */
  component: Type<unknown>;
}
