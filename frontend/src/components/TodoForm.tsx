import { useState } from "react";
import type { SubmitEvent } from "react";

import { chakra, Field, HStack, IconButton, Input } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";

type TodoFormProps = {
  onCreate: (body: string) => Promise<void>;
};

export function TodoForm({ onCreate }: TodoFormProps) {
  const [body, setBody] = useState("");
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

      await onCreate(trimmedBody);

      setBody("");
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
        <HStack align="stretch" gap="4" width="full">
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
            bg="rgba(15, 23, 42, 0.38)"
            borderColor="rgba(148, 163, 184, 0.28)"
            borderWidth="2px"
            color="gray.100"
            fontSize={{ base: "md", md: "lg" }}
            _placeholder={{ color: "gray.500" }}
            _hover={{ borderColor: "gray.500" }}
            _focusVisible={{
              borderColor: "cyan.300",
              boxShadow: "0 0 0 1px var(--chakra-colors-cyan-300)",
            }}
          />

          <IconButton
            type="submit"
            aria-label="Add todo"
            loading={isSubmitting}
            colorPalette="cyan"
            variant="solid"
            h={{ base: "12", md: "14" }}
            minW={{ base: "12", md: "14" }}
            borderRadius="lg"
            bg="gray.700"
            color="gray.100"
            flexShrink="0"
            _hover={{ bg: "gray.600", color: "cyan.200" }}
          >
            <LuPlus size="28" />
          </IconButton>
        </HStack>

        {error && <Field.ErrorText color="red.300">{error}</Field.ErrorText>}
      </Field.Root>
    </chakra.form>
  );
}
