import { useEffect, useState } from "react";

import {
  Box,
  Center,
  Container,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";

import { createTodo, deleteTodo, getTodos, updateTodo } from "./api/todos";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import type { Todo } from "./types/todo";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTodoIDs, setUpdatingTodoIDs] = useState<Set<string>>(
    new Set(),
  );
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [deletingTodoIDs, setDeletingTodoIDs] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadTodos() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getTodos(controller.signal);
        setTodos(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setError(
          error instanceof Error ? error.message : "Failed to retrieve todos",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTodos();

    return () => {
      controller.abort();
    };
  }, []);

  async function handleCreateTodo(body: string) {
    const createdTodo = await createTodo({
      body,
      completed: false,
    });

    setTodos((currentTodos) => [...currentTodos, createdTodo]);
  }

  async function handleToggleTodo(id: string, completed: boolean) {
    setUpdatingTodoIDs((currentIDs) => {
      const nextIDs = new Set(currentIDs);
      nextIDs.add(id);

      return nextIDs;
    });

    setMutationError(null);

    try {
      const updatedTodo = await updateTodo(id, {
        completed,
      });

      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo,
        ),
      );
    } catch (error) {
      setMutationError(
        error instanceof Error ? error.message : "Unable to update todo",
      );
    } finally {
      setUpdatingTodoIDs((currentIDs) => {
        const nextIDs = new Set(currentIDs);
        nextIDs.delete(id);

        return nextIDs;
      });
    }
  }

  async function handleDeleteTodo(id: string) {
    const todoToDelete = todos.find((todo) => todo.id === id);

    const confirmed = window.confirm(
      `Delete "${todoToDelete?.body ?? "this todo"}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingTodoIDs((currentIDs) => {
      const nextIDs = new Set(currentIDs);
      nextIDs.add(id);

      return nextIDs;
    });

    setMutationError(null);

    try {
      await deleteTodo(id);

      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      setMutationError(
        error instanceof Error ? error.message : "Unable to delete todo",
      );
    } finally {
      setDeletingTodoIDs((currentIDs) => {
        const nextIDs = new Set(currentIDs);
        nextIDs.delete(id);

        return nextIDs;
      });
    }
  }

  return (
    <Box
      minH="100vh"
      bg="#171d2b"
      color="gray.100"
      py={{ base: "8", md: "14" }}
    >
      <Container maxW="2xl">
        <Stack gap="5">
          {!isLoading && !error && (
            <TodoForm onCreate={handleCreateTodo} />
          )}

          <Heading
            as="h1"
            size={{ base: "2xl", md: "3xl" }}
            color="cyan.300"
            textAlign="center"
            textTransform="uppercase"
            letterSpacing="wide"
            textShadow="0 0 18px rgba(34, 211, 238, 0.38)"
            py={{ base: "2", md: "3" }}
          >
            Today&apos;s Tasks
          </Heading>

          {isLoading && (
            <Center py="10">
              <Stack align="center" gap="3">
                <Spinner color="cyan.300" size="lg" />

                <Text color="gray.400">Loading tasks...</Text>
              </Stack>
            </Center>
          )}

          {!isLoading && error && (
            <Box
              role="alert"
              borderWidth="1px"
              borderColor="red.800"
              borderRadius="lg"
              bg="rgba(127, 29, 29, 0.24)"
              p="4"
            >
              <Text color="red.200">{error}</Text>
            </Box>
          )}

          {!isLoading && !error && (
            <>
              {mutationError && (
                <Box
                  role="alert"
                  borderWidth="1px"
                  borderColor="red.800"
                  borderRadius="lg"
                  bg="rgba(127, 29, 29, 0.24)"
                  p="4"
                >
                  <Text color="red.200">{mutationError}</Text>
                </Box>
              )}

              <TodoList
                todos={todos}
                updatingTodoIDs={updatingTodoIDs}
                deletingTodoIDs={deletingTodoIDs}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
              />
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
