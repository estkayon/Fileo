import { useState, type DragEvent } from 'react';

interface DropzoneProps {
  accept: string;
  multiple: boolean;
  disabled: boolean;
  onFiles: (files: File[]) => void;
}

export function Dropzone({ accept, multiple, disabled, onFiles }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const emit = (list: FileList | null) => {
    if (disabled || !list || list.length === 0) return;
    onFiles(multiple ? Array.from(list) : [list[0]]);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    emit(event.dataTransfer.files);
  };

  return (
    <label
      className={`dropzone${isDragging ? ' dropzone--active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        hidden
        onChange={(event) => {
          emit(event.target.files);
          event.target.value = '';
        }}
      />
      <span>
        {multiple ? 'Drop files here or click to browse' : 'Drop a file here or click to browse'}
      </span>
    </label>
  );
}
