'use client';

import { ActionIcon, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
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
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={title}
      centered
      size="md"
      withCloseButton={false}
      overlayProps={{ blur: 4 }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg">
            {title}
          </Text>
          <ActionIcon aria-label="Close edit modal" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </ActionIcon>
        </Group>

        <TextInput
          label={fieldLabel}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          placeholder={fieldLabel}
        />

        <Stack gap="xs">
          <Button
            variant="subtle"
            color="danger"
            justify="flex-start"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteDisabled}
            leftSection={<span className="material-symbols-outlined text-lg">delete</span>}
          >
            {deleteLabel}
          </Button>
          {deleteDisabled && (
            <Text size="xs" c="dimmed">
              {deleteDisabledReason}
            </Text>
          )}
        </Stack>

        {showDeleteConfirm && !deleteDisabled && (
          <Stack gap="sm" className="rounded-xl bg-error/10 p-3">
            <Text size="sm">Please confirm delete. This action cannot be undone.</Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                color="danger"
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                  onClose();
                }}
              >
                Confirm delete
              </Button>
            </Group>
          </Stack>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(name);
              onClose();
            }}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
