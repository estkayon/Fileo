import { useState } from 'react';
import {
  DEFAULT_SETTINGS,
  type AnnotationSettings,
  type StampTool,
} from '../features/pdf/annotate/annotationModel';
import { buildAnnotatedPdf } from '../features/pdf/annotate/buildAnnotatedPdf';
import { prepareImage, type PreparedImage } from '../features/pdf/annotate/imageAsset';
import { useImageAssets } from '../features/pdf/annotate/useImageAssets';
import { usePdfAnnotator } from '../features/pdf/annotate/usePdfAnnotator';
import { AnnotatablePage } from './AnnotatablePage';
import { AnnotationToolbar } from './AnnotationToolbar';
import { AsyncDownloadButton } from './AsyncDownloadButton';
import { Dropzone } from './Dropzone';
import { SignaturePad } from './SignaturePad';

export function AnnotatePanel() {
  const { state, load, add, remove, undo } = usePdfAnnotator();
  const createAsset = useImageAssets();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSigning, setIsSigning] = useState(false);
  const [imageError, setImageError] = useState('');

  const handleSettingsChange = (next: AnnotationSettings) => {
    if (next.tool !== settings.tool) {
      setIsSigning(next.tool === 'signature' && !next.assets.signature);
    }
    setSettings(next);
  };

  const setAsset = (tool: StampTool, prepared: PreparedImage) => {
    const asset = createAsset(prepared);
    setSettings((current) => ({ ...current, assets: { ...current.assets, [tool]: asset } }));
  };

  const handleImageFile = async (file: File) => {
    setImageError('');
    try {
      setAsset('image', await prepareImage(file));
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Could not open this image.');
    }
  };

  const handleSignature = (signature: PreparedImage) => {
    setAsset('signature', signature);
    setIsSigning(false);
  };

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
            onChange={handleSettingsChange}
            onUndo={undo}
            onImageFile={handleImageFile}
            onDrawSignature={() => setIsSigning(true)}
          />
          {imageError && <p role="alert">{imageError}</p>}
          {isSigning && (
            <SignaturePad onUse={handleSignature} onCancel={() => setIsSigning(false)} />
          )}

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
