import {
  Box,
  Center,
  Container,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";

import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { useTodos } from "./features/todos/useTodos";
import {
  useCreateTodo,
  useDeleteTodo,
  useUpdateTodo,
} from "./features/todos/useTodoMutations";

function App() {
  const todosQuery = useTodos();
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  const todos = todosQuery.data ?? [];
  const isLoading = todosQuery.isPending;
  const error =
    todosQuery.error instanceof Error
      ? todosQuery.error.message
      : todosQuery.error
        ? "Unable to load tasks"
        : null;

  const mutationErrorValue = updateMutation.error ?? deleteMutation.error;

  const mutationError =
    mutationErrorValue instanceof Error
      ? mutationErrorValue.message
      : updateMutation.error
        ? "Unable to update task"
        : deleteMutation.error
          ? "Unable to delete task"
          : null;

  const updatingTodoIDs = new Set<string>(
    updateMutation.isPending && updateMutation.variables
      ? [updateMutation.variables.id]
      : [],
  );

  const deletingTodoIDs = new Set<string>(
    deleteMutation.isPending && deleteMutation.variables
      ? [deleteMutation.variables]
      : [],
  );

  const handleCreate = async (body: string) => {
    await createMutation.mutateAsync({
      body,
      completed: false,
    });
  };

  const handleComplete = (id: string) => {
    updateMutation.mutate({
      id,
      input: {
        completed: true,
      },
    });
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(id);
  };

  return (
    <Box
      minH="100vh"
      bg="#171d2b"
      color="gray.100"
      py={{ base: "8", md: "14" }}
    >
      <Container maxW="2xl">
        <Stack gap="5">
          {!isLoading && !error && <TodoForm onCreate={handleCreate} />}

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
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
