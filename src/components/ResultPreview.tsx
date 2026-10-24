import { getPreviewKind } from '../features/preview/previewKind';
import type { ConversionResult } from '../types/converter';
import { DocxPreview } from './preview/DocxPreview';
import { HtmlFrame } from './preview/HtmlFrame';
import { ImagePreview } from './preview/ImagePreview';
import { PdfPreview } from './preview/PdfPreview';
import { TextPreview } from './preview/TextPreview';
import { ZipPreview } from './preview/ZipPreview';

interface ResultPreviewProps {
  result: ConversionResult;
}

export function ResultPreview({ result }: ResultPreviewProps) {
  switch (getPreviewKind(result)) {
    case 'image':
      return <ImagePreview {...result} />;
    case 'pdf':
      return <PdfPreview {...result} />;
    case 'html':
      return <HtmlFrame html={result.blob} title={`Preview of ${result.fileName}`} />;
    case 'text':
      return <TextPreview {...result} />;
    case 'docx':
      return <DocxPreview {...result} />;
    case 'zip':
      return <ZipPreview {...result} />;
    default:
      return null;
  }
}
