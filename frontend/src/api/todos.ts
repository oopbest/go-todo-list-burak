import type {
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "../types/todo";

const TODOS_API = "/api/todos";

type ApiErrorResponse = {
  error?: string;
};

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | ApiErrorResponse
      | null;

    const message =
      data?.error ??
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getTodos(
  signal?: AbortSignal,
): Promise<Todo[]> {
  const response = await fetch(TODOS_API, {
    signal,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | ApiErrorResponse
      | null;

    throw new Error(
      data?.error ??
        `Request failed with status ${response.status}`,
    );
  }

  return (await response.json()) as Todo[];
}

export function getTodoByID(
  id: string,
  signal?: AbortSignal,
): Promise<Todo> {
  return request<Todo>(
    `${TODOS_API}/${encodeURIComponent(id)}`,
    { signal },
  );
}

export function createTodo(
  input: CreateTodoInput,
): Promise<Todo> {
  return request<Todo>(TODOS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function updateTodo(
  id: string,
  input: UpdateTodoInput,
): Promise<Todo> {
  return request<Todo>(
    `${TODOS_API}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

export function deleteTodo(id: string): Promise<void> {
  return request<void>(
    `${TODOS_API}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}