import type { ReactNode } from 'react';
import { AnnotatePanel } from './components/AnnotatePanel';
import { ConverterPanel } from './components/ConverterPanel';
import { OrganizePanel } from './components/OrganizePanel';
import { converterGroups } from './features/registry';

export type ToolCategory = 'image' | 'pdf' | 'document' | 'edit';

interface ToolDetails {
  description: string;
  /** Format of the input file, shown on the tool card. */
  from: string;
  /** Format of the output file. Left out when the tool keeps the same format. */
  to?: string;
}

export interface Tool extends ToolDetails {
  id: string;
  label: string;
  category: ToolCategory;
  render: () => ReactNode;
}

export interface ToolGroup {
  category: ToolCategory;
  title: string;
  tools: Tool[];
}

const CATEGORY_BY_GROUP: Record<string, ToolCategory> = {
  Image: 'image',
  PDF: 'pdf',
  Documents: 'document',
};

const CONVERTER_DETAILS: Record<string, ToolDetails> = {
  'image-to-png': {
    description: 'Turn JPG, WebP and other images into PNG.',
    from: 'IMG',
    to: 'PNG',
  },
  'image-to-jpg': {
    description: 'Turn PNG, WebP and other images into JPG.',
    from: 'IMG',
    to: 'JPG',
  },
  'image-to-webp': { description: 'Make light WebP images for websites.', from: 'IMG', to: 'WEBP' },
  'image-compress': { description: 'Make images smaller while keeping them sharp.', from: 'IMG' },
  'image-resize': { description: 'Change the size of images in pixels.', from: 'IMG' },
  'images-to-pdf': {
    description: 'Put one or more images into a single PDF.',
    from: 'IMG',
    to: 'PDF',
  },
  'pdf-merge': { description: 'Join several PDFs into one, in the order you choose.', from: 'PDF' },
  'pdf-extract-pages': { description: 'Take out a range of pages as a new PDF.', from: 'PDF' },
  'pdf-to-images': { description: 'Save every PDF page as a PNG image.', from: 'PDF', to: 'PNG' },
  'pdf-to-text': { description: 'Copy all the text out of a PDF.', from: 'PDF', to: 'TXT' },
  'pdf-to-word': {
    description: 'Turn a PDF into a Word file you can edit.',
    from: 'PDF',
    to: 'DOCX',
  },
  'word-to-html': {
    description: 'Open a Word file as a web page or a PDF.',
    from: 'DOCX',
    to: 'PDF',
  },
  'markdown-to-html': {
    description: 'Turn Markdown notes into a web page or a PDF.',
    from: 'MD',
    to: 'PDF',
  },
};

function getConverterDetails(id: string): ToolDetails {
  const details = CONVERTER_DETAILS[id];
  if (!details) throw new Error(`Tool "${id}" has no card details in tools.tsx.`);
  return details;
}

export const toolGroups: ToolGroup[] = [
  ...converterGroups.map(({ title, converters }) => {
    const category = CATEGORY_BY_GROUP[title];
    return {
      category,
      title,
      tools: converters.map((converter) => ({
        id: converter.id,
        label: converter.label,
        category,
        ...getConverterDetails(converter.id),
        render: () => <ConverterPanel converter={converter} />,
      })),
    };
  }),
  {
    category: 'edit',
    title: 'Edit PDF',
    tools: [
      {
        id: 'pdf-organize',
        label: 'Organize pages',
        category: 'edit',
        description: 'Reorder, rotate or delete the pages of a PDF.',
        from: 'PDF',
        render: () => <OrganizePanel />,
      },
      {
        id: 'pdf-annotate',
        label: 'Add text & draw',
        category: 'edit',
        description: 'Write, draw, highlight and sign on a PDF.',
        from: 'PDF',
        render: () => <AnnotatePanel />,
      },
    ],
  },
];

export const tools = toolGroups.flatMap((group) => group.tools);
