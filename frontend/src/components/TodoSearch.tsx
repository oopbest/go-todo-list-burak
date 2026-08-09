import { Box, IconButton, Input } from "@chakra-ui/react";
import { LuSearch, LuX } from "react-icons/lu";

type TodoSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
};

export function TodoSearch({ value, onChange, onClear }: TodoSearchProps) {
  return (
    <Box position="relative" width="full">
      <Box
        position="absolute"
        left="3"
        top="50%"
        transform="translateY(-50%)"
        color="fg.muted"
        pointerEvents="none"
        zIndex="1"
      >
        <LuSearch aria-hidden="true" />
      </Box>

      <Input
        type="search"
        aria-label="Search tasks"
        value={value}
        placeholder="Search tasks..."
        autoComplete="off"
        pl="10"
        pr={value ? "12" : "4"}
        bg="bg.panel"
        borderWidth="2px"
        borderColor="border.emphasized"
        _focusVisible={{
          borderColor: "cyan.600",
          boxShadow: "0 0 0 1px var(--chakra-colors-cyan-600)",
        }}
        _dark={{
          bg: "rgba(15, 23, 42, 0.38)",
          borderColor: "rgba(148, 163, 184, 0.28)",
          _focusVisible: {
            borderColor: "cyan.300",
            boxShadow: "0 0 0 1px var(--chakra-colors-cyan-300)",
          },
        }}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />

      {value && (
        <IconButton
          type="button"
          aria-label="Clear search"
          title="Clear search"
          size="xs"
          variant="ghost"
          position="absolute"
          right="2"
          top="50%"
          transform="translateY(-50%)"
          color="fg.muted"
          onClick={onClear}
        >
          <LuX />
        </IconButton>
      )}
    </Box>
  );
}
