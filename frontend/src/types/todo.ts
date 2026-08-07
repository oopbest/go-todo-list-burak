export type Todo = {
  id: string;
  completed: boolean;
  body: string;
};

export type CreateTodoInput = {
  completed: boolean;
  body: string;
};

export type UpdateTodoInput = {
  completed?: boolean;
  body?: string;
};