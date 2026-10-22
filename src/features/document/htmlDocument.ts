const DOCUMENT_STYLES = `
  body {
    max-width: 48rem;
    margin: 2rem auto;
    padding: 0 1rem;
    color: #111;
    font-family: system-ui, 'Segoe UI', 'Noto Sans Bengali', Kalpurush, sans-serif;
    line-height: 1.6;
  }
  img { max-width: 100%; height: auto; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 0.4rem 0.6rem; }
  pre { padding: 1rem; background: #f5f5f5; white-space: pre-wrap; overflow-wrap: anywhere; }
  code { font-family: ui-monospace, Consolas, monospace; }
  blockquote { margin-left: 0; padding-left: 1rem; border-left: 3px solid #ccc; color: #444; }
  @page { margin: 18mm; }
  @media print { body { max-width: none; margin: 0; padding: 0; } }
`;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function buildHtmlDocument(title: string, bodyHtml: string): Promise<Blob> {
  const { default: DOMPurify } = await import('dompurify');
  const safeBody = DOMPurify.sanitize(bodyHtml);

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${DOCUMENT_STYLES}</style>
</head>
<body>
${safeBody}
</body>
</html>`;

  return new Blob([html], { type: 'text/html;charset=utf-8' });
}
