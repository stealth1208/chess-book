import {
  ActionIcon,
  Button,
  Code,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Textarea
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useTopicStore } from '@/shared/store/useTopicStore';
import { TopicStructure } from './TopicStructure/TopicStructure';

interface NewVariationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  mode?: 'create' | 'edit';
  initialName?: string;
  initialDescription?: string;
  initialFolderId?: string | null;
  initialMoves?: string[];
  onSubmit?: (payload: { name: string; description: string; folderId: string | null }) => void;
  onDelete?: () => void;
}

const DEFAULT_VARIATION_NAME_PREFIX = 'Bien moi';
const DEFAULT_FOLDER_NAME = 'Thu muc moi';

export const NewVariationModal = ({
  isOpen = false,
  onClose,
  mode,
  initialName = '',
  initialDescription = '',
  initialFolderId,
  initialMoves = [],
  onSubmit,
  onDelete,
}: NewVariationModalProps) => {
  const {
    topics,
    folders,
    selectedTopicId,
    selectedFolderId,
    createFolder,
    selectFolder,
  } = useTopicStore();

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [folderId, setFolderId] = useState<string | null>(initialFolderId ?? selectedFolderId ?? null);

  const resolvedMode = mode ?? (onDelete ? 'edit' : 'create');
  const isEditMode = resolvedMode === 'edit';

  const currentTopicId = useMemo(() => {
    if (folderId) {
      const folder = folders.find((item) => item.id === folderId) ?? null;
      if (folder) {
        return folder.topicId;
      }
    }

    return selectedTopicId ?? topics[0]?.id ?? null;
  }, [folderId, folders, selectedTopicId, topics]);

  const handleClose = () => {
    onClose?.();
  };

  const handleCreateFolder = () => {
    if (!currentTopicId) {
      return;
    }

    const newFolderId = createFolder(DEFAULT_FOLDER_NAME, folderId, currentTopicId);
    if (!newFolderId) {
      return;
    }

    setFolderId(newFolderId);
    selectFolder(newFolderId);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const finalName = trimmedName.length > 0
      ? trimmedName
      : `${DEFAULT_VARIATION_NAME_PREFIX} ${new Date().toLocaleTimeString()}`;

    onSubmit?.({
      name: finalName,
      description: description.trim(),
      folderId,
    });

    onClose?.();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextFolderId = initialFolderId ?? selectedFolderId ?? null;
    selectFolder(nextFolderId);
  }, [
    initialFolderId,
    isOpen,
    selectFolder,
    selectedFolderId,
  ]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Cap nhat bien di' : 'Luu bien di moi'}
      size="lg"
      centered
      withCloseButton={false}
      overlayProps={{ blur: 4 }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg">
            {isEditMode ? 'Cap nhat bien di' : 'Luu bien di moi'}
          </Text>
          <ActionIcon variant="subtle" aria-label="Dong modal" onClick={handleClose}>
            <span className="material-symbols-outlined">close</span>
          </ActionIcon>
        </Group>

        <TextInput
          label="Ten bien di"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          placeholder="Binh phong ma - Bien 4"
        />

        <Textarea
          label="Mo ta bien di"
          minRows={3}
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          placeholder="Them ghi chu cho bien di nay"
        />

        {initialMoves.length > 0 && (
          <Stack gap={4}>
            <Text fw={600} size="sm" c="dimmed">
              Ky phap hien tai
            </Text>
            <Paper withBorder p="sm" radius="md">
              <ScrollArea h={80}>
                <Code block>{initialMoves.join(' ')}</Code>
              </ScrollArea>
            </Paper>
          </Stack>
        )}

        <Stack gap={6}>
          <Group justify="space-between" align="center">
            <Text fw={600} size="sm" c="dimmed">
              Thu muc luu tru
            </Text>
            <Button size="xs" variant="light" onClick={handleCreateFolder}>
              + Thu muc
            </Button>
          </Group>

          <Paper withBorder p={0} radius="md" className="h-72 overflow-hidden">
            <TopicStructure />
          </Paper>
        </Stack>

        <Group justify="space-between" mt="sm">
          <div>
            {isEditMode && onDelete && (
              <Button variant="subtle" color="danger" onClick={onDelete}>
                Xoa bien
              </Button>
            )}
          </div>

          <Group gap="sm">
            <Button variant="default" onClick={handleClose}>
              Huy bo
            </Button>
            <Button onClick={handleSave}>{isEditMode ? 'Luu thay doi' : 'Luu bien di'}</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};
