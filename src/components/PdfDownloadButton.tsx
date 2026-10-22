import { useState } from 'react';
import { htmlToPdf } from '../features/document/htmlToPdf';
import { downloadResult } from '../lib/download';

interface PdfDownloadButtonProps {
  html: Blob;
  fileName: string;
}

type PdfState = { status: 'idle' } | { status: 'working' } | { status: 'error'; message: string };

export function PdfDownloadButton({ html, fileName }: PdfDownloadButtonProps) {
  const [state, setState] = useState<PdfState>({ status: 'idle' });

  const handleClick = async () => {
    setState({ status: 'working' });
    try {
      downloadResult({ blob: await htmlToPdf(html), fileName });
      setState({ status: 'idle' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create the PDF.';
      setState({ status: 'error', message });
    }
  };

  return (
    <>
      <button
        type="button"
        className="action"
        disabled={state.status === 'working'}
        onClick={handleClick}
      >
        {state.status === 'working' ? 'Creating PDF...' : 'Download PDF'}
      </button>
      {state.status === 'error' && <p role="alert">{state.message}</p>}
    </>
  );
}
