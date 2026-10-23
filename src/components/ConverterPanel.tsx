import { useState } from 'react';
import { useConversion } from '../features/useConversion';
import type { ConversionOptions, Converter } from '../types/converter';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import { OptionsForm } from './OptionsForm';
import { ProgressBar } from './ProgressBar';
import { ResultList } from './ResultList';

const MAX_FILES = 50;

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
  const [notice, setNotice] = useState('');

  const inputMode = converter.inputMode ?? 'batch';
  const isConverting = state.status === 'converting';
  const convertLabel =
    inputMode === 'batch' && files.length > 1 ? `Convert ${files.length} files` : 'Convert';

  const handleFilesAdded = (added: File[]) => {
    const next = inputMode === 'single' ? added : [...files, ...added];
    setFiles(next.slice(0, MAX_FILES));
    setNotice(next.length > MAX_FILES ? `Only the first ${MAX_FILES} files were added.` : '');
    reset();
  };

  const handleFilesChange = (next: File[]) => {
    setFiles(next);
    setNotice('');
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
        multiple={inputMode !== 'single'}
        disabled={isConverting}
        onFiles={handleFilesAdded}
      />
      {notice && <p role="status">{notice}</p>}

      <fieldset className="controls" disabled={isConverting}>
        <FileList files={files} reorderable={inputMode === 'merge'} onChange={handleFilesChange} />
        {converter.options && (
          <OptionsForm options={converter.options} values={values} onChange={handleOptionsChange} />
        )}
      </fieldset>

      <button
        type="button"
        className="action"
        disabled={files.length === 0 || isConverting}
        onClick={() => run(files, values)}
      >
        {convertLabel}
      </button>

      {state.status === 'converting' && (
        <ProgressBar progress={state.progress} completed={state.completed} total={state.total} />
      )}
      {state.status === 'done' && <ResultList items={state.items} />}
    </section>
  );
}
