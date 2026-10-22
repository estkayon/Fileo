import { useConversion } from '../features/useConversion';
import { downloadResult } from '../lib/download';
import type { Converter } from '../types/converter';
import { Dropzone } from './Dropzone';

interface ConverterPanelProps {
  converter: Converter;
}

export function ConverterPanel({ converter }: ConverterPanelProps) {
  const { state, run } = useConversion(converter);

  return (
    <section className="panel">
      <Dropzone accept={converter.accept} disabled={state.status === 'converting'} onFile={run} />

      {state.status === 'converting' && <p role="status">Converting...</p>}
      {state.status === 'error' && <p role="alert">{state.message}</p>}
      {state.status === 'done' && (
        <button type="button" className="download" onClick={() => downloadResult(state.result)}>
          Download {state.result.fileName}
        </button>
      )}
    </section>
  );
}
