import { useState } from "react";
import type { KeyboardEvent } from "react";

import {
  Badge,
  Box,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";

import {
  LuCheck,
  LuCircleCheckBig,
  LuPencil,
  LuTrash2,
  LuX,
} from "react-icons/lu";

import type { Todo } from "../types/todo";

type TodoItemProps = {
  todo: Todo;
  isUpdating: boolean;
  isDeleting: boolean;
  onComplete: (id: string) => void;
  onEdit: (id: string, body: string) => Promise<void>;
  onDelete: (id: string) => void;
};

export function TodoItem({
  todo,
  isUpdating,
  isDeleting,
  onComplete,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const isBusy = isUpdating || isDeleting;
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(todo.body);
  const [editError, setEditError] = useState<string | null>(null);

  function startEditing() {
    setEditedBody(todo.body);
    setEditError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditedBody(todo.body);
    setEditError(null);
    setIsEditing(false);
  }

  async function saveEdit() {
    const trimmedBody = editedBody.trim();

    if (trimmedBody === "") {
      setEditError("Task title is required");
      return;
    }

    if (trimmedBody === todo.body) {
      setIsEditing(false);
      return;
    }

    try {
      setEditError(null);

      await onEdit(todo.id, trimmedBody);

      setIsEditing(false);
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Unable to update task",
      );
    }
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void saveEdit();
    }

    if (event.key === "Escape") {
      cancelEditing();
    }
  }

  return (
    <Stack
      as="li"
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "center" }}
      gap="2"
      opacity={isBusy ? 0.7 : 1}
    >
      <Box
        minW="0"
        flex="1"
        borderWidth="2px"
        borderColor="border.emphasized"
        borderRadius="lg"
        bg="bg.panel"
        px={{ base: "3", md: "4" }}
        py="3"
        _dark={{
          borderColor: "rgba(148, 163, 184, 0.28)",
          bg: "rgba(15, 23, 42, 0.34)",
        }}
      >
        {isEditing ? (
          <Stack gap="2">
            <HStack align="stretch" gap="2">
              <Input
                aria-label={`Edit ${todo.body}`}
                value={editedBody}
                autoFocus
                disabled={isUpdating}
                onChange={(event) => {
                  setEditedBody(event.target.value);

                  if (editError) {
                    setEditError(null);
                  }
                }}
                onKeyDown={handleEditKeyDown}
              />

              <IconButton
                type="button"
                aria-label="Save task"
                title="Save"
                colorPalette="green"
                loading={isUpdating}
                disabled={isDeleting}
                onClick={() => {
                  void saveEdit();
                }}
              >
                <LuCheck />
              </IconButton>

              <IconButton
                type="button"
                aria-label="Cancel editing"
                title="Cancel"
                variant="outline"
                disabled={isBusy}
                onClick={cancelEditing}
              >
                <LuX />
              </IconButton>
            </HStack>

            {editError && (
              <Text color="red.600" fontSize="sm" _dark={{ color: "red.300" }}>
                {editError}
              </Text>
            )}
          </Stack>
        ) : (
          <HStack justify="space-between" gap="3">
            <Text
              minW="0"
              color={todo.completed ? "green.700" : "yellow.800"}
              fontSize={{ base: "md", md: "lg" }}
              textDecoration={todo.completed ? "line-through" : "none"}
              textDecorationThickness="2px"
              textDecorationColor="cyan.600"
              overflowWrap="anywhere"
              _dark={{
                color: todo.completed ? "green.200" : "yellow.100",
                textDecorationColor: "cyan.300",
              }}
            >
              {todo.body}
            </Text>

            <Badge
              flexShrink="0"
              colorPalette={todo.completed ? "green" : "yellow"}
              variant="subtle"
              fontWeight="bold"
              letterSpacing="wide"
            >
              {todo.completed ? "DONE" : "IN PROGRESS"}
            </Badge>
          </HStack>
        )}
      </Box>

      <HStack
        justify={{ base: "flex-end", sm: "initial" }}
        gap="1"
        flexShrink="0"
      >
        <IconButton
          type="button"
          aria-label={
            todo.completed
              ? `${todo.body} is already completed`
              : `Mark ${todo.body} as done`
          }
          title={todo.completed ? "Task completed" : "Mark as done"}
          size="sm"
          variant="ghost"
          colorPalette="green"
          color="green.600"
          loading={isUpdating}
          disabled={isBusy || todo.completed}
          borderRadius="full"
          _hover={{ bg: "green.50", color: "green.700" }}
          _dark={{
            color: "green.300",
            _hover: {
              bg: "rgba(34, 197, 94, 0.15)",
              color: "green.200",
            },
          }}
          onClick={() => {
            if (!todo.completed) {
              onComplete(todo.id);
            }
          }}
        >
          <LuCircleCheckBig size="22" />
        </IconButton>

        <IconButton
          type="button"
          aria-label={`Edit ${todo.body}`}
          title="Edit task"
          size="sm"
          variant="ghost"
          colorPalette="blue"
          color="blue.600"
          disabled={isBusy || isEditing}
          onClick={startEditing}
          _hover={{ bg: "blue.50", color: "blue.700" }}
          _dark={{
            color: "blue.300",
            _hover: {
              bg: "rgba(59, 130, 246, 0.15)",
              color: "blue.200",
            },
          }}
        >
          <LuPencil size="20" />
        </IconButton>

        <IconButton
          type="button"
          aria-label={`Delete ${todo.body}`}
          title="Delete task"
          size="sm"
          variant="ghost"
          colorPalette="red"
          color="red.600"
          loading={isDeleting}
          disabled={isBusy}
          onClick={() => {
            onDelete(todo.id);
          }}
          _hover={{ bg: "red.50", color: "red.700" }}
          _dark={{
            color: "red.400",
            _hover: {
              bg: "rgba(239, 68, 68, 0.15)",
              color: "red.300",
            },
          }}
        >
          <LuTrash2 size="20" />
        </IconButton>
      </HStack>
    </Stack>
  );
}
