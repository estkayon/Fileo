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

export interface Converter {
  id: string;
  label: string;
  accept: string;
  options?: ConverterOption[];
  convert: (file: File, options: ConversionOptions) => Promise<ConversionResult>;
}
