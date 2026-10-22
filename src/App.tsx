import { useState } from 'react';
import { ConverterPanel } from './components/ConverterPanel';
import { ToolSelector } from './components/ToolSelector';
import { converters } from './features/registry';

function App() {
  const [selectedId, setSelectedId] = useState(converters[0].id);
  const selected = converters.find(({ id }) => id === selectedId) ?? converters[0];

  return (
    <main className="app">
      <h1>Fileo</h1>
      <p>Free, privacy-first file converter. Your files never leave your device.</p>
      <ToolSelector converters={converters} selectedId={selected.id} onSelect={setSelectedId} />
      <ConverterPanel key={selected.id} converter={selected} />
    </main>
  );
}

export default App;
