const MAX_ENTRIES = 12;

const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export interface ZipEntry {
  name: string;
  /** The picture itself when the entry is an image, otherwise null. */
  image: Blob | null;
}

export interface ZipContents {
  entries: ZipEntry[];
  totalFiles: number;
}

/** Reads the first files of a ZIP so images inside it can be shown. */
export async function readZipEntries(zip: Blob): Promise<ZipContents> {
  const { unzipSync } = await import('fflate');
  let totalFiles = 0;

  const files = unzipSync(new Uint8Array(await zip.arrayBuffer()), {
    filter: ({ name }) => {
      if (name.endsWith('/')) return false;
      totalFiles += 1;
      return totalFiles <= MAX_ENTRIES;
    },
  });

  const entries = Object.entries(files).map(([name, data]) => {
    const type = IMAGE_TYPES[name.split('.').pop()?.toLowerCase() ?? ''];
    return { name, image: type ? new Blob([new Uint8Array(data)], { type }) : null };
  });
  return { entries, totalFiles };
}
