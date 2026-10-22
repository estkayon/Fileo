import { useCallback, useState } from 'react';
import type { ConversionResult, Converter } from '../types/converter';

export type ConversionState =
  | { status: 'idle' }
  | { status: 'converting' }
  | { status: 'done'; result: ConversionResult }
  | { status: 'error'; message: string };

export function useConversion(converter: Converter) {
  const [state, setState] = useState<ConversionState>({ status: 'idle' });

  const run = useCallback(
    async (file: File) => {
      setState({ status: 'converting' });
      try {
        setState({ status: 'done', result: await converter.convert(file) });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        setState({ status: 'error', message });
      }
    },
    [converter],
  );

  return { state, run };
}
