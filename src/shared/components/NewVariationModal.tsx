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
  Textarea,
  Alert
} from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '@/shared/store/useGameStore';
import { useTopicStore } from '@/shared/store/useTopicStore';
import { TopicStructure } from './TopicStructure/TopicStructure';
import { parseVietnameseNotation } from '@/features/engine/notation/parseVietnameseNotation';

interface NewVariationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentNotation?: string;
}

const DEFAULT_VARIATION_NAME_PREFIX = 'Bien moi';
const DEFAULT_FOLDER_NAME = 'Thu muc moi';

export const NewVariationModal = ({
  isOpen = false,
  onClose,
  currentNotation = '',
}: NewVariationModalProps) => {
  const {
    topics,
    folders,
    variations,
    selectedTopicId,
    selectedFolderId,
    editVariationId,
    createFolder,
    selectFolder,
    saveVariation: saveTopicVariation,
    updateVariation,
    renameVariation,
    deleteVariation,
    moveVariationToFolder,
  } = useTopicStore();

  const { initialFen, moves, loadVariation } = useGameStore();

  const editVariation = editVariationId
    ? (variations.find((v) => v.id === editVariationId) ?? null)
    : null;

  const isEditMode = editVariation !== null;

  const [name, setName] = useState(editVariation?.name ?? '');
  const [description, setDescription] = useState(editVariation?.description ?? '');
  const [parseError, setParseError] = useState<string | null>(null);
  const [hasUnconfirmedChanges, setHasUnconfirmedChanges] = useState(false);

  const initialFolderIdRef = useRef(editVariation?.folderId ?? selectedFolderId ?? null);
  const hasLoadedNotationRef = useRef(false);

  const currentTopicId = useMemo(() => {
    if (selectedFolderId) {
      const folder = folders.find((item) => item.id === selectedFolderId) ?? null;
      if (folder) {
        return folder.topicId;
      }
    }
    return selectedTopicId ?? topics[0]?.id ?? null;
  }, [selectedFolderId, folders, selectedTopicId, topics]);

  const handleClose = () => {
    onClose?.();
  };

  const handleCreateFolder = () => {
    if (!currentTopicId) {
      return;
    }

    const newFolderId = createFolder(DEFAULT_FOLDER_NAME, selectedFolderId, currentTopicId);
    if (!newFolderId) {
      return;
    }

    selectFolder(newFolderId);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const finalName = trimmedName.length > 0
      ? trimmedName
      : `${DEFAULT_VARIATION_NAME_PREFIX} ${new Date().toLocaleTimeString()}`;

    if (isEditMode && editVariation) {
      // In edit mode: update name, description, and folder
      updateVariation(editVariation.id, {
        name: finalName,
        description: description.trim() || undefined,
      });
      
      if (editVariation.folderId !== selectedFolderId) {
        moveVariationToFolder(editVariation.id, selectedFolderId);
      }
    } else {
      // Create new variation
      saveTopicVariation(finalName, initialFen, moves, selectedFolderId, description.trim() || undefined);
    }

    onClose?.();
  };

  const handleDelete = () => {
    if (!editVariation) {
      return;
    }
    deleteVariation(editVariation.id);
    onClose?.();
  };

  useEffect(() => {
    if (!isOpen) {
      hasLoadedNotationRef.current = false;
      setParseError(null);
      setHasUnconfirmedChanges(false);
      return;
    }
    
    selectFolder(initialFolderIdRef.current);
    
    // In edit mode, load the variation's moves and description
    if (isEditMode && editVariation) {
      setName(editVariation.name);
      setDescription(editVariation.description ?? '');
      
      const { loadVariation: loadGameVariation } = useGameStore.getState();
      loadGameVariation(editVariation.initialFen, editVariation.moves.map(m => m.uci));
      return;
    }

    // Handle notation pasting in create mode
    if (currentNotation && !hasLoadedNotationRef.current && !isEditMode) {
      hasLoadedNotationRef.current = true;
      const result = parseVietnameseNotation(currentNotation, initialFen);
      
      if (Array.isArray(result)) {
        const { loadVariation: loadGameVariation, moves: currentMoves, jumpTo } = useGameStore.getState();
        
        // If there are existing moves, ask for confirmation
        if (currentMoves.length > 0) {
          const confirmed = window.confirm(
            'Ban dang co bien di hien tai. Thay the chung bang ky phap moi?'
          );
          if (!confirmed) {
            setParseError('Huy thao tac dan');
            return;
          }
        }
        
        loadGameVariation(initialFen, result);
        setParseError(null);
        
        // Move to the last position after loading
        if (result.length > 0) {
          setTimeout(() => {
            jumpTo(result.length - 1);
          }, 0);
        }
      } else {
        setParseError(result.error);
      }
    }
  }, [isOpen, selectFolder, currentNotation, initialFen, isEditMode, editVariation]);

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

        {parseError && (
          <Alert color="red" title="Loi phan tich ky phap">
            {parseError}
          </Alert>
        )}

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
        
          <Stack gap={4}>
            <Text fw={600} size="sm" c="dimmed">
              Ky phap hien tai
            </Text>
            <Paper withBorder p="sm" radius="md">
              <ScrollArea h={80}>
                <Code block>{moves.map((move) => move.notation).join(' ')}</Code>
              </ScrollArea>
            </Paper>
          </Stack>

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
            {isEditMode && (
              <Button variant="subtle" color="danger" onClick={handleDelete}>
                Xoa bien
              </Button>
            )}
          </div>

          <Group gap="sm">
            <Button variant="default" onClick={handleClose}>
              Huy bo
            </Button>
            <Button onClick={handleSave} disabled={parseError !== null}>
              {isEditMode ? 'Luu thay doi' : 'Luu bien di'}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};
