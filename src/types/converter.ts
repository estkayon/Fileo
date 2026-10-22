export interface ConversionResult {
  blob: Blob;
  fileName: string;
}

export interface Converter {
  id: string;
  label: string;
  accept: string;
  convert: (file: File) => Promise<ConversionResult>;
}
