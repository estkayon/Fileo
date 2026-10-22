export function buildFileName(originalName: string, extension: string, suffix = ''): string {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  return `${baseName}${suffix}.${extension}`;
}
