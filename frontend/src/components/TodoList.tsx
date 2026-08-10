import { Box, Stack, Text } from "@chakra-ui/react";

import type { Todo, TodoPriority } from "../types/todo";
import { TodoItem } from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  emptyMessage?: string;
  updatingTodoIDs: Set<string>;
  deletingTodoIDs: Set<string>;
  onComplete: (id: string) => void;
  onEdit: (
    id: string,
    body: string,
    priority: TodoPriority,
  ) => Promise<void>;
  onDelete: (id: string) => void;
};

export function TodoList({
  todos,
  emptyMessage = "No tasks yet.",
  updatingTodoIDs,
  deletingTodoIDs,
  onComplete,
  onEdit,
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
        <Text color="fg.muted">{emptyMessage}</Text>
      </Box>
    );
  }

  return (
    <Stack as="ul" gap="3" listStyleType="none" p="0" m="0">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isUpdating={updatingTodoIDs.has(todo.id)}
          isDeleting={deletingTodoIDs.has(todo.id)}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}
