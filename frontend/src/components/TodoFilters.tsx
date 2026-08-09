import { Badge, Button, Flex } from "@chakra-ui/react";

import type { TodoCounts, TodoFilter } from "../types/todo";

type TodoFiltersProps = {
  value: TodoFilter;
  counts: TodoCounts;
  onChange: (filter: TodoFilter) => void;
};

export function TodoFilters({ value, counts, onChange }: TodoFiltersProps) {
  const filters: Array<{
    value: TodoFilter;
    label: string;
    count: number;
  }> = [
    {
      value: "all",
      label: "ALL",
      count: counts.all,
    },
    {
      value: "in-progress",
      label: "IN PROGRESS",
      count: counts.inProgress,
    },
    {
      value: "done",
      label: "DONE",
      count: counts.done,
    },
  ];

  return (
    <Flex
      role="group"
      aria-label="Filter tasks"
      justify="center"
      wrap="wrap"
      gap="2"
    >
      {filters.map((filter) => {
        const isActive = value === filter.value;

        return (
          <Button
            key={filter.value}
            type="button"
            size="sm"
            variant={isActive ? "solid" : "outline"}
            colorPalette={isActive ? "cyan" : "gray"}
            aria-pressed={isActive}
            onClick={() => {
              onChange(filter.value);
            }}
          >
            {filter.label}

            <Badge
              ml="1"
              colorPalette={isActive ? "cyan" : "gray"}
              variant={isActive ? "solid" : "subtle"}
            >
              {filter.count}
            </Badge>
          </Button>
        );
      })}
    </Flex>
  );
}
