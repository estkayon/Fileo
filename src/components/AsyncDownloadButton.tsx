import { useState } from 'react';
import { downloadResult } from '../lib/download';
import type { ConversionResult } from '../types/converter';

interface AsyncDownloadButtonProps {
  label: string;
  busyLabel: string;
  createFile: (onProgress: (fraction: number) => void) => Promise<ConversionResult>;
}

type ButtonState =
  | { status: 'idle' }
  | { status: 'working'; progress: number }
  | { status: 'error'; message: string };

export function AsyncDownloadButton({ label, busyLabel, createFile }: AsyncDownloadButtonProps) {
  const [state, setState] = useState<ButtonState>({ status: 'idle' });

  const handleClick = async () => {
    setState({ status: 'working', progress: 0 });
    try {
      const file = await createFile((progress) => setState({ status: 'working', progress }));
      downloadResult(file);
      setState({ status: 'idle' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create the file.';
      setState({ status: 'error', message });
    }
  };

  const percent =
    state.status === 'working' && state.progress > 0 ? ` ${Math.round(state.progress * 100)}%` : '';

  return (
    <>
      <button
        type="button"
        className="action"
        disabled={state.status === 'working'}
        onClick={handleClick}
      >
        {state.status === 'working' ? `${busyLabel}${percent}` : label}
      </button>
      {state.status === 'error' && <p role="alert">{state.message}</p>}
    </>
  );
}
