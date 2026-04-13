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
import { TopicView } from '@/features/TopicView';
import { useTopicStore } from '@/shared/store/useTopicStore';

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

type NewVariationModalContentProps = Omit<NewVariationModalProps, 'isOpen'> & {
  selectedFolderId: string | null;
};

function NewVariationModalContent({
  onClose,
  mode = 'create',
  initialName = '',
  initialDescription = '',
  initialFolderId,
  initialMoves = [],
  onSubmit,
  onDelete,
  selectedFolderId,
}: NewVariationModalContentProps) {
  const {
    topics,
    folders,
    selectedTopicId,
    selectFolder,
    expandFolderPath,
    createFolder,
    renameFolder,
  } = useTopicStore();

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [folderId, setFolderId] = useState<string | null>(initialFolderId ?? selectedFolderId ?? null);

  const isEditMode = mode === 'edit';

  const resetFormState = () => {
    setName('');
    setDescription('');
  };

  const currentTopicId = useMemo(() => {
    if (folderId) {
      const folder = folders.find((item) => item.id === folderId) ?? null;
      if (folder) {
        return folder.topicId;
      }
    }

    return selectedTopicId ?? topics[0]?.id ?? null;
  }, [folderId, folders, selectedTopicId, topics]);

  useEffect(() => {
    const nextFolderId = initialFolderId ?? selectedFolderId ?? null;

    selectFolder(nextFolderId);

    if (nextFolderId) {
      expandFolderPath(nextFolderId);
    }
  }, [expandFolderPath, initialFolderId, selectFolder, selectedFolderId]);

  const handleCreateFolder = () => {
    if (!currentTopicId) {
      return;
    }

    const newFolderId = createFolder('Thu muc moi', folderId, currentTopicId);
    if (!newFolderId) {
      return;
    }

    const nextName = window.prompt('Ten thu muc', 'Thu muc moi');
    if (nextName && nextName.trim()) {
      renameFolder(newFolderId, nextName.trim());
    }

    setFolderId(newFolderId);
    selectFolder(newFolderId);
    expandFolderPath(newFolderId);
  };

  const handleSave = () => {
    const finalName = name.trim() || `Bien moi ${new Date().toLocaleTimeString()}`;

    if (onSubmit) {
      onSubmit({ name: finalName, description, folderId });
    }

    resetFormState();
    onClose?.();
  };

  const handleClose = () => {
    resetFormState();
    onClose?.();
  };

  return (
    <Modal
      opened
      onClose={handleClose}
      title={isEditMode ? 'Cập nhật biến đi' : 'Lưu biến đi mới'}
      size="lg"
      centered
      withCloseButton={false}
      overlayProps={{ blur: 4 }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg">
            {isEditMode ? 'Cập nhật biến đi' : 'Lưu biến đi mới'}
          </Text>
          <ActionIcon variant="subtle" aria-label="Đóng" onClick={handleClose}>
            <span className="material-symbols-outlined">close</span>
          </ActionIcon>
        </Group>

        <TextInput
          label="Tên biến đi"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          placeholder="Binh Phong Ma - Bien 4"
        />

        <Textarea
          label="Mô tả biến đi"
          minRows={3}
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          placeholder="Thêm ghi chú hoặc mô tả chi tiết cho biến đi này..."
        />

        {initialMoves.length > 0 && (
          <Stack gap={4}>
            <Text fw={600} size="sm" c="dimmed">
              Ký pháp hiện tại
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
              Thư mục lưu trữ
            </Text>
            <Button size="xs" variant="light" onClick={handleCreateFolder}>
              + Thu muc
            </Button>
          </Group>

          <Paper withBorder p={0} radius="md" className="h-72 overflow-hidden">
            <TopicView
              showHeader={false}
              showNodeActions={false}
              showVariations={false}
              onSelectTopic={() => setFolderId(null)}
              onSelectFolder={(nextFolderId) => setFolderId(nextFolderId)}
            />
          </Paper>
        </Stack>

        <Group justify="space-between" mt="sm">
          <div>
            {isEditMode && onDelete && (
              <Button variant="subtle" color="danger" onClick={onDelete}>
                Xóa biến
              </Button>
            )}
          </div>

          <Group gap="sm">
            <Button variant="default" onClick={handleClose}>
              Hủy bỏ
            </Button>
            <Button onClick={handleSave}>{isEditMode ? 'Lưu thay đổi' : 'Lưu biến đi'}</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}

export function NewVariationModal({
  isOpen = false,
  onClose,
  mode = 'create',
  initialName = '',
  initialDescription = '',
  initialFolderId,
  initialMoves = [],
  onSubmit,
  onDelete,
}: NewVariationModalProps) {
  const { selectedFolderId } = useTopicStore();

  if (!isOpen) {
    return null;
  }

  return (
    <NewVariationModalContent
      onClose={onClose}
      mode={mode}
      initialName={initialName}
      initialDescription={initialDescription}
      initialFolderId={initialFolderId}
      initialMoves={initialMoves}
      onSubmit={onSubmit}
      onDelete={onDelete}
      selectedFolderId={selectedFolderId}
    />
  );
}
