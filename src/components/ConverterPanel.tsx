import { useState } from 'react';
import { useConversion } from '../features/useConversion';
import { downloadResult } from '../lib/download';
import { formatBytes } from '../lib/formatBytes';
import type { ConversionOptions, Converter } from '../types/converter';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import { OptionsForm } from './OptionsForm';

interface ConverterPanelProps {
  converter: Converter;
}

function getDefaultOptions({ options = [] }: Converter): ConversionOptions {
  return Object.fromEntries(options.map(({ id, defaultValue }) => [id, defaultValue]));
}

export function ConverterPanel({ converter }: ConverterPanelProps) {
  const { state, run, reset } = useConversion(converter);
  const [files, setFiles] = useState<File[]>([]);
  const [values, setValues] = useState(() => getDefaultOptions(converter));
  const isConverting = state.status === 'converting';

  const handleFilesAdded = (added: File[]) => {
    setFiles((current) => (converter.multiple ? [...current, ...added] : added));
    reset();
  };

  const handleFilesChange = (next: File[]) => {
    setFiles(next);
    reset();
  };

  const handleOptionsChange = (next: ConversionOptions) => {
    setValues(next);
    reset();
  };

  return (
    <section className="panel">
      <Dropzone
        accept={converter.accept}
        multiple={converter.multiple ?? false}
        disabled={isConverting}
        onFiles={handleFilesAdded}
      />

      <FileList files={files} onChange={handleFilesChange} />

      {converter.options && (
        <OptionsForm options={converter.options} values={values} onChange={handleOptionsChange} />
      )}

      <button
        type="button"
        className="action"
        disabled={files.length === 0 || isConverting}
        onClick={() => run(files, values)}
      >
        Convert
      </button>

      {isConverting && <p role="status">Converting...</p>}
      {state.status === 'error' && <p role="alert">{state.message}</p>}
      {state.status === 'done' && (
        <>
          <p>
            {formatBytes(state.originalSize)} → {formatBytes(state.result.blob.size)}
          </p>
          <button type="button" className="action" onClick={() => downloadResult(state.result)}>
            Download {state.result.fileName}
          </button>
        </>
      )}
    </section>
  );
}
