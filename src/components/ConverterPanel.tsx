import { useEffect, useRef, useState } from 'react';
import { useConversion } from '../features/useConversion';
import type { ConversionOptions, Converter } from '../types/converter';
import { ConversionOutput } from './ConversionOutput';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import { OptionsForm } from './OptionsForm';
import { ProgressBar } from './ProgressBar';

const MAX_FILES = 50;
/** Same width as the CSS breakpoint where the result moves below the form. */
const STACKED_LAYOUT = '(max-width: 60rem)';

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
  const outputRef = useRef<HTMLElement>(null);

  const inputMode = converter.inputMode ?? 'batch';
  const isConverting = state.status === 'converting';
  const convertLabel =
    inputMode === 'batch' && files.length > 1 ? `Convert ${files.length} files` : 'Convert';

  // On small screens the result sits below the form, so bring it into view when it is ready.
  useEffect(() => {
    if (state.status !== 'done' || !window.matchMedia(STACKED_LAYOUT).matches) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    outputRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [state.status]);

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
    <div className="workspace">
      <section className="panel workspace__input" aria-label="Files and options">
        <Dropzone
          accept={converter.accept}
          multiple={inputMode !== 'single'}
          disabled={isConverting}
          onFiles={handleFilesAdded}
        />
        {notice && <p role="status">{notice}</p>}

        <fieldset className="controls" disabled={isConverting}>
          <FileList
            files={files}
            reorderable={inputMode === 'merge'}
            onChange={handleFilesChange}
          />
          {converter.options && (
            <OptionsForm
              options={converter.options}
              values={values}
              onChange={handleOptionsChange}
            />
          )}
        </fieldset>

        <button
          type="button"
          className="action workspace__convert"
          disabled={files.length === 0 || isConverting}
          onClick={() => run(files, values)}
        >
          {convertLabel}
        </button>
      </section>

      <section
        ref={outputRef}
        className={`panel workspace__output${state.status === 'idle' ? ' workspace__output--idle' : ''}`}
        aria-label="Result"
        aria-live="polite"
      >
        {state.status === 'idle' && (
          <p className="output__empty">
            {files.length === 0
              ? 'Add a file, then press Convert. The result shows here.'
              : 'Press Convert to see the result here.'}
          </p>
        )}
        {state.status === 'converting' && (
          <ProgressBar progress={state.progress} completed={state.completed} total={state.total} />
        )}
        {state.status === 'done' && <ConversionOutput items={state.items} />}
      </section>
    </div>
  );
}