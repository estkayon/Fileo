import { useCallback } from 'react';
import { useLoad } from '../../features/preview/useLoad';
import { useObjectUrls } from '../../features/useObjectUrls';
import { LoadState } from './LoadState';

interface HtmlFrameProps {
  html: Blob;
  title: string;
}

/** Shows an HTML document in a sandbox, so nothing inside it can run scripts. */
export function HtmlFrame({ html, title }: HtmlFrameProps) {
  const createUrl = useObjectUrls();
  const state = useLoad(useCallback(async () => createUrl(html), [html, createUrl]));

  return (
    <LoadState state={state}>
      {(url) => <iframe className="preview__frame" title={title} src={url} sandbox="" />}
    </LoadState>
  );
}
