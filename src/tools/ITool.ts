import { ComponentType } from 'react';

/**
 * Shape of a tool that can be rendered in the application.
 * Component should be a self-contained React component that handles its own state.
 */
export interface ITool {
  /** Unique identifier for the tool */
  id: string;

  /** Display name shown in the menu */
  name: string;

  /** Short description of what the tool does */
  description: string;

  /** React component that renders the tool UI */
  Component: ComponentType;
}
