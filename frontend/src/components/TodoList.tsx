import { Badge, Box, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import { LuCircleCheckBig, LuTrash2 } from "react-icons/lu";

import type { Todo } from "../types/todo";

type TodoListProps = {
  todos: Todo[];
  updatingTodoIDs: Set<string>;
  deletingTodoIDs: Set<string>;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TodoList({
  todos,
  updatingTodoIDs,
  deletingTodoIDs,
  onComplete,
  onDelete,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <Box
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="border.emphasized"
        borderRadius="xl"
        py="10"
        textAlign="center"
        bg="bg.panel"
        _dark={{
          borderColor: "rgba(148, 163, 184, 0.32)",
          bg: "rgba(15, 23, 42, 0.25)",
        }}
      >
        <Text color="fg.muted">No tasks yet.</Text>
      </Box>
    );
  }

  return (
    <Stack as="ul" gap="3" listStyleType="none" p="0" m="0">
      {todos.map((todo) => {
        const isUpdating = updatingTodoIDs.has(todo.id);
        const isDeleting = deletingTodoIDs.has(todo.id);
        const isBusy = isUpdating || isDeleting;

        return (
          <Stack
            as="li"
            key={todo.id}
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
                aria-label={`Delete ${todo.body}`}
                title="Delete task"
                size="sm"
                variant="ghost"
                colorPalette="red"
                color="red.600"
                loading={isDeleting}
                disabled={isBusy}
                _hover={{ bg: "red.50", color: "red.700" }}
                _dark={{
                  color: "red.400",
                  _hover: {
                    bg: "rgba(239, 68, 68, 0.15)",
                    color: "red.300",
                  },
                }}
                onClick={() => {
                  onDelete(todo.id);
                }}
              >
                <LuTrash2 size="20" />
              </IconButton>
            </HStack>
          </Stack>
        );
      })}
    </Stack>
  );
}
