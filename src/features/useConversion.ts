import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConversionOptions, Converter } from '../types/converter';
import { runJob, type ConversionItem } from './runJob';

export type ConversionState =
  | { status: 'idle' }
  | { status: 'converting'; progress: number; completed: number; total: number }
  | { status: 'done'; items: ConversionItem[] };

function splitIntoJobs(converter: Converter, files: File[]): File[][] {
  const isBatch = (converter.inputMode ?? 'batch') === 'batch';
  return isBatch ? files.map((file) => [file]) : [files];
}

export function useConversion(converter: Converter) {
  const [state, setState] = useState<ConversionState>({ status: 'idle' });
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (files: File[], options: ConversionOptions) => {
      const jobs = splitIntoJobs(converter, files);
      const items: ConversionItem[] = [];

      // Files run one after another so a big batch does not exhaust the browser's memory.
      for (const [index, job] of jobs.entries()) {
        const report = (fraction: number) =>
          setState({
            status: 'converting',
            progress: (index + fraction) / jobs.length,
            completed: index,
            total: jobs.length,
          });

        report(0);
        items.push(await runJob(converter, job, options, report));
        if (!isMounted.current) return;
      }

      setState({ status: 'done', items });
    },
    [converter],
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, run, reset };
}
