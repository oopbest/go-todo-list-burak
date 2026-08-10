import { useState } from "react";
import type { SubmitEvent } from "react";

import {
  chakra,
  Field,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Stack,
} from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";

import type { TodoPriority } from "../types/todo";

type TodoFormProps = {
  onCreate: (body: string, priority: TodoPriority) => Promise<void>;
};

export function TodoForm({ onCreate }: TodoFormProps) {
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedBody = body.trim();

    if (trimmedBody === "") {
      setError("Please enter a todo");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await onCreate(trimmedBody, priority);

      setBody("");
      setPriority("medium");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create todo",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <chakra.form onSubmit={handleSubmit} width="full">
      <Field.Root invalid={error !== null} width="full">
        <Stack
          direction={{ base: "column", md: "row" }}
          align="stretch"
          gap="3"
          width="full"
        >
          <Input
            aria-label="Add a new todo"
            value={body}
            onChange={(event) => {
              setBody(event.target.value);

              if (error) {
                setError(null);
              }
            }}
            placeholder="What needs to be done?"
            disabled={isSubmitting}
            flex="1"
            minW="0"
            h={{ base: "12", md: "14" }}
            bg="bg.panel"
            borderColor="border.emphasized"
            borderWidth="2px"
            color="fg"
            fontSize={{ base: "md", md: "lg" }}
            _placeholder={{ color: "fg.muted" }}
            _hover={{ borderColor: "gray.400" }}
            _focusVisible={{
              borderColor: "cyan.600",
              boxShadow: "0 0 0 1px var(--chakra-colors-cyan-600)",
            }}
            _dark={{
              bg: "rgba(15, 23, 42, 0.38)",
              borderColor: "rgba(148, 163, 184, 0.28)",
              color: "gray.100",
              _placeholder: { color: "gray.500" },
              _hover: { borderColor: "gray.500" },
              _focusVisible: {
                borderColor: "cyan.300",
                boxShadow: "0 0 0 1px var(--chakra-colors-cyan-300)",
              },
            }}
          />

          <HStack align="stretch" gap="3">
            <NativeSelect.Root
              flex="1"
              minW={{ md: "44" }}
              disabled={isSubmitting}
            >
              <NativeSelect.Field
                aria-label="Task priority"
                value={priority}
                h={{ base: "12", md: "14" }}
                bg="bg.panel"
                borderWidth="2px"
                borderColor="border.emphasized"
                borderRadius="lg"
                cursor="pointer"
                pr="10"
                _hover={{ borderColor: "gray.400" }}
                _focusVisible={{
                  borderColor: "cyan.600",
                  boxShadow: "0 0 0 1px var(--chakra-colors-cyan-600)",
                }}
                onChange={(event) => {
                  setPriority(event.target.value as TodoPriority);
                }}
                _dark={{
                  bg: "rgba(15, 23, 42, 0.38)",
                  borderColor: "rgba(148, 163, 184, 0.28)",
                  _hover: { borderColor: "gray.500" },
                  _focusVisible: {
                    borderColor: "cyan.300",
                    boxShadow: "0 0 0 1px var(--chakra-colors-cyan-300)",
                  },
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

            <IconButton
              type="submit"
              aria-label="Add todo"
              loading={isSubmitting}
              colorPalette="cyan"
              variant="solid"
              h={{ base: "12", md: "14" }}
              minW={{ base: "12", md: "14" }}
              borderRadius="lg"
              bg="gray.800"
              color="white"
              flexShrink="0"
              _hover={{ bg: "gray.700", color: "cyan.100" }}
              _dark={{
                bg: "gray.700",
                color: "gray.100",
                _hover: { bg: "gray.600", color: "cyan.200" },
              }}
            >
              <LuPlus size="28" />
            </IconButton>
          </HStack>
        </Stack>

        {error && (
          <Field.ErrorText color="red.600" _dark={{ color: "red.300" }}>
            {error}
          </Field.ErrorText>
        )}
      </Field.Root>
    </chakra.form>
  );
}
