export const taskPriorities = ["low", "medium", "high"] as const;

export type TaskPriority = (typeof taskPriorities)[number];

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
  priority: TaskPriority;
  scheduledDate: string;
  remindAt: string | null;
  reminderSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CreateTaskInput = {
  id: string;
  title: string;
  priority: TaskPriority;
  scheduledDate: string;
  remindAt?: string | null;
  now: string;
};

export function createTask(input: CreateTaskInput): Task {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Task title cannot be empty.");
  }

  return {
    id: input.id,
    title,
    completed: false,
    completedAt: null,
    priority: input.priority,
    scheduledDate: input.scheduledDate,
    remindAt: input.remindAt ?? null,
    reminderSentAt: null,
    createdAt: input.now,
    updatedAt: input.now,
  };
}

export function toDateTimeLocalValue(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
