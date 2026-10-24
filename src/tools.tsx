import type { ReactNode } from 'react';
import { AnnotatePanel } from './components/AnnotatePanel';
import { ConverterPanel } from './components/ConverterPanel';
import { OrganizePanel } from './components/OrganizePanel';
import { converterGroups } from './features/registry';

export interface Tool {
  id: string;
  label: string;
  render: () => ReactNode;
}

export interface ToolGroup {
  title: string;
  tools: Tool[];
}

export const toolGroups: ToolGroup[] = [
  ...converterGroups.map(({ title, converters }) => ({
    title,
    tools: converters.map((converter) => ({
      id: converter.id,
      label: converter.label,
      render: () => <ConverterPanel converter={converter} />,
    })),
  })),
  {
    title: 'Edit PDF',
    tools: [
      { id: 'pdf-organize', label: 'Organize pages', render: () => <OrganizePanel /> },
      { id: 'pdf-annotate', label: 'Add text & draw', render: () => <AnnotatePanel /> },
    ],
  },
];

export const tools = toolGroups.flatMap((group) => group.tools);
