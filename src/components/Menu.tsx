import appIcon from '../assets/images/ATiconTransparent.png';
import { ITool } from '../tools/ITool';

/**
 * Props for the navigation menu component.
 */
interface MenuProps {
  tools: ITool[];
  selectedToolId?: string;
  onSelect: (toolId: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isOpen: boolean;
  onToggleMenu: () => void;
}

/**
 * Decorative icon that reflects the current theme and provides an accessible label for toggling.
 *
 * @param props - Contains the current theme.
 * @returns SVG indicating light or dark mode.
 */
function ThemeIcon({ theme }: { theme: 'light' | 'dark' }): JSX.Element {
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  if (theme === 'dark') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={label}>
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"></path>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={label}>
      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"></path>
    </svg>
  );
}

/**
 * Application side menu listing available tools and theme/menu toggles.
 *
 * @param props - Tool list, selection state, and UI toggles.
 * @returns Structured menu UI.
 */
export function Menu({
  tools,
  selectedToolId,
  onSelect,
  theme,
  onToggleTheme,
  isOpen,
  onToggleMenu,
}: MenuProps): JSX.Element {
  return (
    <div className={`menu ${isOpen ? 'menu-open' : ''}`}>
      <div className="menu-header">
        <h1>
          <img src={appIcon} alt="" className="menu-logo" aria-hidden="true" />
          Aviation Tools
        </h1>
        <div className="menu-actions">
          <button className="theme-toggle" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={onToggleTheme}>
            <ThemeIcon theme={theme} />
          </button>
          <button id="menu-toggle" className="menu-toggle" aria-label="Toggle menu" onClick={onToggleMenu}>
            <span className="hamburger"></span>
          </button>
        </div>
      </div>
      <nav className="menu-nav">
        <div className="menu-section">
          <ul className="tool-list">
            {tools.map((tool) => (
              <li key={tool.id}>
                <button
                  className={`tool-button ${selectedToolId === tool.id ? 'active' : ''}`}
                  title={tool.description}
                  onClick={() => onSelect(tool.id)}
                >
                  <span className="tool-name">{tool.name}</span>
                  <span className="tool-desc">{tool.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="menu-footer">
        <p>Aviation Tools v1.0</p>
        <p><small>Offline-capable PWA</small></p>
      </div>
    </div>
  );
}

