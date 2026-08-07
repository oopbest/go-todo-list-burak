import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTodo, deleteTodo, updateTodo } from "../../api/todos";
import type { CreateTodoInput, UpdateTodoInput } from "../../types/todo";
import { todoKeys } from "./queryKeys";

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: todoKeys.all,
      });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      updateTodo(id, input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: todoKeys.all,
      });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: todoKeys.all,
      });
    },
  });
}
