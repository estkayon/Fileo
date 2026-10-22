import { useState } from 'react';
import { ConverterPanel } from './components/ConverterPanel';
import { ToolSelector } from './components/ToolSelector';
import { converters, toolGroups } from './features/registry';

function App() {
  const [selectedId, setSelectedId] = useState(converters[0].id);
  const selected = converters.find(({ id }) => id === selectedId) ?? converters[0];

  return (
    <main className="app">
      <header>
        <h1>Fileo</h1>
        <p className="app__tagline">
          Free, privacy-first file converter. Your files never leave your device.
        </p>
      </header>
      <ToolSelector groups={toolGroups} selectedId={selected.id} onSelect={setSelectedId} />
      <ConverterPanel key={selected.id} converter={selected} />
    </main>
  );
}

export default App;
