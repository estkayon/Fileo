import { useState } from 'react';
import { DEFAULT_SETTINGS } from '../features/pdf/annotate/annotationModel';
import { buildAnnotatedPdf } from '../features/pdf/annotate/buildAnnotatedPdf';
import { usePdfAnnotator } from '../features/pdf/annotate/usePdfAnnotator';
import { AnnotatablePage } from './AnnotatablePage';
import { AnnotationToolbar } from './AnnotationToolbar';
import { AsyncDownloadButton } from './AsyncDownloadButton';
import { Dropzone } from './Dropzone';

export function AnnotatePanel() {
  const { state, load, add, remove, undo } = usePdfAnnotator();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  return (
    <section className="panel">
      <Dropzone
        accept="application/pdf"
        multiple={false}
        disabled={state.status === 'loading'}
        onFiles={([file]) => load(file)}
      />

      {state.status === 'loading' && <p role="status">Opening PDF...</p>}
      {state.status === 'error' && <p role="alert">{state.message}</p>}

      {state.status === 'ready' && (
        <>
          {state.warning && <p role="alert">{state.warning}</p>}

          <AnnotationToolbar
            settings={settings}
            canUndo={state.annotations.length > 0}
            onChange={setSettings}
            onUndo={undo}
          />

          <ol className="annotate-pages">
            {state.pages.map((page, pageIndex) => (
              <li key={pageIndex}>
                <span className="annotate-pages__label">Page {pageIndex + 1}</span>
                <AnnotatablePage
                  pageIndex={pageIndex}
                  page={page}
                  annotations={state.annotations.filter(
                    (annotation) => annotation.pageIndex === pageIndex,
                  )}
                  settings={settings}
                  onAdd={add}
                  onRemove={remove}
                />
              </li>
            ))}
          </ol>

          <AsyncDownloadButton
            label="Download PDF"
            busyLabel="Saving..."
            createFile={() => buildAnnotatedPdf(state.file, state.annotations)}
          />
        </>
      )}
    </section>
  );
}
