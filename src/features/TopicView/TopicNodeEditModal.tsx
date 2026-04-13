'use client';

import { useMemo, useState } from 'react';

interface TopicNodeEditModalProps {
  isOpen: boolean;
  mode: 'topic' | 'folder';
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
  onDelete: () => void;
  deleteDisabled: boolean;
  deleteDisabledReason: string;
}

export const TopicNodeEditModal = ({
  isOpen,
  mode,
  initialName,
  onClose,
  onSave,
  onDelete,
  deleteDisabled,
  deleteDisabledReason,
}: TopicNodeEditModalProps) => {
  const [name, setName] = useState(initialName);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const title = useMemo(() => (mode === 'topic' ? 'Edit topic' : 'Edit folder'), [mode]);
  const fieldLabel = mode === 'topic' ? 'Topic name' : 'Folder name';
  const deleteLabel = mode === 'topic' ? 'Delete topic' : 'Delete folder';

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant/15 px-5 py-4">
          <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container"
            aria-label="Close edit modal"
          >
            close
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <div className="space-y-2">
            <label htmlFor="topic-node-name" className="text-sm font-semibold text-on-surface-variant">
              {fieldLabel}
            </label>
            <input
              id="topic-node-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface outline-none transition-colors focus:border-primary"
              placeholder={fieldLabel}
            />
          </div>

          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteDisabled}
              aria-label={deleteLabel}
              title={deleteLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-error/25 text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:border-outline-variant/30 disabled:text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
            {deleteDisabled && (
              <p className="mt-2 text-xs text-on-surface-variant">{deleteDisabledReason}</p>
            )}
          </div>

          {showDeleteConfirm && !deleteDisabled && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-3">
              <p className="text-sm text-on-surface">Please confirm delete. This action cannot be undone.</p>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="rounded-lg bg-error px-3 py-1.5 text-sm font-semibold text-on-error"
                >
                  Confirm delete
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-outline-variant/15 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(name);
              onClose();
            }}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-on-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
