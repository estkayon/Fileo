import { useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { SiteHeader } from './components/SiteHeader';
import { ToolPage } from './components/ToolPage';
import { useTheme } from './features/theme/useTheme';
import { useHashRoute } from './features/useHashRoute';
import { tools } from './tools';

function App() {
  const { theme, toggleTheme } = useTheme();
  const route = useHashRoute();
  const tool = tools.find(({ id }) => id === route);

  useEffect(() => {
    document.title = tool ? `${tool.label} | Fileo` : 'Fileo: free file converter and PDF editor';
    window.scrollTo(0, 0);
  }, [tool]);

  return (
    <>
      <SiteHeader theme={theme} onToggleTheme={toggleTheme} />
      {tool ? <ToolPage key={tool.id} tool={tool} /> : <HomePage />}
      <footer className="site-footer">
        <p>Fileo is free to use. Your files are processed on your device and never uploaded.</p>
        <p>© {new Date().getFullYear()} Md. Estiak Rahman Ayon. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
