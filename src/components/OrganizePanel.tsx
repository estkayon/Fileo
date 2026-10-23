import { buildOrganizedPdf } from '../features/pdf/organize/buildOrganizedPdf';
import { keptPages } from '../features/pdf/organize/pageModel';
import { usePageOrganizer } from '../features/pdf/organize/usePageOrganizer';
import { AsyncDownloadButton } from './AsyncDownloadButton';
import { Dropzone } from './Dropzone';
import { PageCard } from './PageCard';

export function OrganizePanel() {
  const { state, load, rotate, toggleDeleted, move } = usePageOrganizer();

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
          <p>
            {keptPages(state.pages).length} of {state.pages.length} pages will be saved. Use the
            buttons under each page to move, rotate or delete it.
          </p>
          {state.warning && <p role="alert">{state.warning}</p>}

          <ul className="pages">
            {state.pages.map((page, position) => (
              <PageCard
                key={page.sourceIndex}
                page={page}
                isFirst={position === 0}
                isLast={position === state.pages.length - 1}
                onMove={(offset) => move(position, offset)}
                onRotate={(degrees) => rotate(page.sourceIndex, degrees)}
                onToggleDeleted={() => toggleDeleted(page.sourceIndex)}
              />
            ))}
          </ul>

          <AsyncDownloadButton
            label="Download PDF"
            busyLabel="Saving..."
            createFile={() => buildOrganizedPdf(state.file, state.pages)}
          />
        </>
      )}
    </section>
  );
}
