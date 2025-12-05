import { ITool } from '../tools/ITool';

/**
 * Props for {@link ToolContainer}.
 */
interface ToolContainerProps {
  tool?: ITool;
}

/**
 * Renders the active tool component or a loading state when no tool is selected yet.
 *
 * @param props - Contains the active tool definition to render.
 * @returns Wrapper element hosting the selected tool component.
 */
export function ToolContainer({ tool }: ToolContainerProps): JSX.Element {
  if (!tool) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Select a tool to get started.</p>
      </div>
    );
  }

  const ToolComponent = tool.Component;

  return (
    <div className="tool-wrapper" key={tool.id}>
      <ToolComponent />
    </div>
  );
}
