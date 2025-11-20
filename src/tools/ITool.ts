/**
 * Interface that all aviation tools must implement
 */
export interface ITool {
  /** Unique identifier for the tool */
  id: string;
  
  /** Display name shown in the menu */
  name: string;
  
  /** Short description of what the tool does */
  description: string;
  
  /** Render the tool's UI into the provided container */
  render(container: HTMLElement): void;
  
  /** Clean up event listeners and resources when tool is unmounted */
  destroy(): void;
}