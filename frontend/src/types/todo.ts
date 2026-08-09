export type Todo = {
  id: string;
  completed: boolean;
  body: string;
};

export type TodoFilter = "all" | "in-progress" | "done";

export type TodoCounts = {
  all: number;
  inProgress: number;
  done: number;
};

export type CreateTodoInput = {
  completed: boolean;
  body: string;
};

export type UpdateTodoInput = {
  completed?: boolean;
  body?: string;
};
