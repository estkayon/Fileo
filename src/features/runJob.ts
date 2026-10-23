import type { ConversionOptions, ConversionResult, Converter } from '../types/converter';

export type ConversionItem = { name: string; sourceSize: number } & (
  { status: 'done'; result: ConversionResult } | { status: 'error'; message: string }
);

export async function runJob(
  converter: Converter,
  files: File[],
  options: ConversionOptions,
  onProgress: (fraction: number) => void,
): Promise<ConversionItem> {
  const name = files.length === 1 ? files[0].name : `${files.length} files`;
  const sourceSize = files.reduce((total, file) => total + file.size, 0);

  try {
    const result = await converter.convert(files, options, { onProgress });
    return { name, sourceSize, status: 'done', result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    return { name, sourceSize, status: 'error', message };
  }
}
