export interface ConversionResult {
  blob: Blob;
  fileName: string;
}

export type ConversionOptions = Record<string, number>;

export interface ConverterOption {
  id: string;
  label: string;
  input: 'range' | 'number';
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
}

export interface ConvertContext {
  /** Reports how far the conversion is, from 0 to 1. */
  onProgress: (fraction: number) => void;
}

/**
 * batch (default): every selected file is converted on its own.
 * merge: all selected files become one output, and their order matters.
 * single: only one file is accepted.
 */
export type InputMode = 'batch' | 'merge' | 'single';

export interface Converter {
  id: string;
  label: string;
  accept: string;
  inputMode?: InputMode;
  options?: ConverterOption[];
  convert: (
    files: File[],
    options: ConversionOptions,
    context: ConvertContext,
  ) => Promise<ConversionResult>;
}

export interface ConverterGroup {
  title: string;
  converters: Converter[];
}
