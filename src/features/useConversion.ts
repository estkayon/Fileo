import { useCallback, useState } from 'react';
import type { ConversionOptions, ConversionResult, Converter } from '../types/converter';

export type ConversionState =
  | { status: 'idle' }
  | { status: 'converting' }
  | { status: 'done'; result: ConversionResult; originalSize: number }
  | { status: 'error'; message: string };

export function useConversion(converter: Converter) {
  const [state, setState] = useState<ConversionState>({ status: 'idle' });

  const run = useCallback(
    async (file: File, options: ConversionOptions) => {
      setState({ status: 'converting' });
      try {
        const result = await converter.convert(file, options);
        setState({ status: 'done', result, originalSize: file.size });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        setState({ status: 'error', message });
      }
    },
    [converter],
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, run, reset };
}
