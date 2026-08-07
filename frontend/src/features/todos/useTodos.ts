import { useQuery } from "@tanstack/react-query";

import { getTodos } from "../../api/todos";
import { todoKeys } from "./queryKeys";

export function useTodos() {
  return useQuery({
    queryKey: todoKeys.all,
    queryFn: ({ signal }) => getTodos(signal),
  });
}
