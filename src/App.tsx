import { Fragment, useState } from 'react';
import { ToolSelector } from './components/ToolSelector';
import { toolGroups, tools } from './tools';

function App() {
  const [selectedId, setSelectedId] = useState(tools[0].id);
  const selected = tools.find(({ id }) => id === selectedId) ?? tools[0];

  return (
    <main className="app">
      <header>
        <h1>Fileo</h1>
        <p className="app__tagline">
          Free, privacy-first file converter. Your files never leave your device.
        </p>
      </header>
      <ToolSelector groups={toolGroups} selectedId={selected.id} onSelect={setSelectedId} />
      <Fragment key={selected.id}>{selected.render()}</Fragment>
    </main>
  );
}

export default App;
