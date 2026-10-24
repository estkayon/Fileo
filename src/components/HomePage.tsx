import { useState } from 'react';
import { toolGroups, type ToolCategory } from '../tools';
import { ToolCard } from './ToolCard';

type Filter = ToolCategory | 'all';

export function HomePage() {
  const [filter, setFilter] = useState<Filter>('all');
  const visibleGroups = toolGroups.filter((group) => filter === 'all' || group.category === filter);

  return (
    <main className="home">
      <section className="hero">
        <h1 className="hero__title">Convert and edit your files, right here in the browser.</h1>
        <p className="hero__lead">
          Fileo does all its work on your device. Files are never uploaded, stored or seen by anyone
          else, and every tool is free.
        </p>
      </section>

      <div className="filters" role="group" aria-label="Show tools for">
        {[{ category: 'all' as const, title: 'All tools' }, ...toolGroups].map(
          ({ category, title }) => (
            <button
              key={category}
              type="button"
              className={`filter${filter === category ? ' filter--active' : ''}`}
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {title}
            </button>
          ),
        )}
      </div>

      {visibleGroups.map((group) => (
        <section key={group.category} className="tool-section" aria-labelledby={group.category}>
          <h2 id={group.category} className="tool-section__title">
            {group.title}
          </h2>
          <ul className="tool-grid">
            {group.tools.map((tool) => (
              <li key={tool.id}>
                <ToolCard {...tool} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
