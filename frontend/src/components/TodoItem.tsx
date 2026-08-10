import { useState } from "react";
import type { KeyboardEvent } from "react";

import {
  Badge,
  Box,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";

import {
  LuCheck,
  LuCircleCheckBig,
  LuFlag,
  LuPencil,
  LuTrash2,
  LuX,
} from "react-icons/lu";

import type { Todo, TodoPriority } from "../types/todo";

const priorityColorPalettes: Record<TodoPriority, string> = {
  low: "gray",
  medium: "blue",
  high: "red",
};

type TodoItemProps = {
  todo: Todo;
  isUpdating: boolean;
  isDeleting: boolean;
  onComplete: (id: string) => void;
  onEdit: (
    id: string,
    body: string,
    priority: TodoPriority,
  ) => Promise<void>;
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
  const priority = todo.priority || "medium";
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(todo.body);
  const [editedPriority, setEditedPriority] =
    useState<TodoPriority>(priority);
  const [editError, setEditError] = useState<string | null>(null);

  function startEditing() {
    setEditedBody(todo.body);
    setEditedPriority(priority);
    setEditError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditedBody(todo.body);
    setEditedPriority(priority);
    setEditError(null);
    setIsEditing(false);
  }

  async function saveEdit() {
    const trimmedBody = editedBody.trim();

    if (trimmedBody === "") {
      setEditError("Task title is required");
      return;
    }

    if (trimmedBody === todo.body && editedPriority === priority) {
      setIsEditing(false);
      return;
    }

    try {
      setEditError(null);

      await onEdit(todo.id, trimmedBody, editedPriority);

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
            <Stack
              direction={{ base: "column", md: "row" }}
              align="stretch"
              gap="2"
            >
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

              <NativeSelect.Root
                minW={{ md: "40" }}
                disabled={isBusy}
              >
                <NativeSelect.Field
                  aria-label={`Priority for ${todo.body}`}
                  value={editedPriority}
                  borderRadius="md"
                  cursor="pointer"
                  pr="10"
                  _focusVisible={{
                    borderColor: "cyan.600",
                    boxShadow: "0 0 0 1px var(--chakra-colors-cyan-600)",
                  }}
                  _dark={{
                    _focusVisible: {
                      borderColor: "cyan.300",
                      boxShadow: "0 0 0 1px var(--chakra-colors-cyan-300)",
                    },
                  }}
                  onChange={(event) => {
                    setEditedPriority(
                      event.target.value as TodoPriority,
                    );
                  }}
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </NativeSelect.Field>

                <NativeSelect.Indicator
                  color="fg.muted"
                  pointerEvents="none"
                />
              </NativeSelect.Root>

              <HStack align="stretch" gap="2">
                <IconButton
                  type="button"
                  aria-label="Save task"
                  title="Save"
                  colorPalette="green"
                  loading={isUpdating}
                  disabled={isDeleting}
                  flex={{ base: "1", md: "initial" }}
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
                  flex={{ base: "1", md: "initial" }}
                  onClick={cancelEditing}
                >
                  <LuX />
                </IconButton>
              </HStack>
            </Stack>

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

            <HStack flexShrink="0" gap="2" flexWrap="wrap" justify="flex-end">
              <HStack
                as="span"
                gap="1"
                px="2"
                py="0.5"
                borderWidth="1px"
                borderColor={`${priorityColorPalettes[priority]}.300`}
                borderRadius="full"
                color={`${priorityColorPalettes[priority]}.700`}
                bg="transparent"
                _dark={{
                  borderColor: `${priorityColorPalettes[priority]}.500`,
                  color: `${priorityColorPalettes[priority]}.200`,
                }}
              >
                <LuFlag size="12" aria-hidden="true" />

                <Text
                  as="span"
                  fontSize="xs"
                  fontWeight="bold"
                  lineHeight="short"
                  letterSpacing="wide"
                  textTransform="uppercase"
                >
                  {priority}
                </Text>
              </HStack>

              <Badge
                colorPalette={todo.completed ? "green" : "yellow"}
                variant="solid"
                fontWeight="bold"
                letterSpacing="wide"
              >
                {todo.completed ? "DONE" : "IN PROGRESS"}
              </Badge>
            </HStack>
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
