export type Todo = {
  id: string;
  completed: boolean;
  body: string;
  priority: TodoPriority;
};

export type TodoFilter = "all" | "in-progress" | "done";
export type TodoPriority = "low" | "medium" | "high";

export type TodoCounts = {
  all: number;
  inProgress: number;
  done: number;
};

export type CreateTodoInput = {
  completed: boolean;
  body: string;
  priority: TodoPriority;
};

export type UpdateTodoInput = {
  completed?: boolean;
  body?: string;
  priority?: TodoPriority;
};
