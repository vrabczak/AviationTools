import { useEffect, useMemo, useState } from 'react';
import { Menu } from './components/Menu';
import { ToolContainer } from './components/ToolContainer';
import { tools, getToolById } from './tools/ToolRegistry';

/**
 * Root application component that manages theme, menu state, and selected tool.
 * Persists theme selection and keeps the selected tool synchronized with the registry.
 *
 * @returns Top-level UI layout combining the menu and active tool.
 */
export function App(): JSX.Element {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('aviation-tools-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [selectedToolId, setSelectedToolId] = useState<string>(() => tools[0]?.id ?? '');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth <= 600 : false));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aviation-tools-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!selectedToolId && tools[0]) {
      setSelectedToolId(tools[0].id);
    }
  }, [selectedToolId]);

  const selectedTool = useMemo(() => getToolById(selectedToolId) ?? tools[0], [selectedToolId]);

  /**
   * Handles selecting a tool from the menu and closes the menu on mobile.
   *
   * @param toolId - Identifier of the tool chosen by the user.
   */
  const handleSelectTool = (toolId: string) => {
    setSelectedToolId(toolId);
    setIsMenuOpen(false);
  };

  return (
    <div id="app">
      <aside id="menu-container" className={isMenuOpen ? 'menu-open' : ''}>
        <Menu
          tools={tools}
          selectedToolId={selectedTool?.id}
          onSelect={handleSelectTool}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          isOpen={isMenuOpen}
          onToggleMenu={() => setIsMenuOpen((open) => !open)}
        />
      </aside>
      <main id="tool-container">
        <ToolContainer tool={selectedTool} />
      </main>
    </div>
  );
}
