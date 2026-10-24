import { HOME_HREF } from '../features/useHashRoute';
import type { Tool } from '../tools';

export function ToolPage({ tool }: { tool: Tool }) {
  return (
    <main className="tool-page">
      <a className="back-link" href={HOME_HREF}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M14 8H3m4-4-4 4 4 4" />
        </svg>
        All tools
      </a>
      <h1 className="tool-page__title">{tool.label}</h1>
      <p className="tool-page__description">{tool.description}</p>
      {tool.render()}
    </main>
  );
}
