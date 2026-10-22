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
    async (files: File[], options: ConversionOptions) => {
      setState({ status: 'converting' });
      try {
        const result = await converter.convert(files, options);
        const originalSize = files.reduce((total, file) => total + file.size, 0);
        setState({ status: 'done', result, originalSize });
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
