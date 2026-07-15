import type { Task, TaskPriority } from "./task";

export type TaskAction =
  | { type: "replace"; tasks: Task[] }
  | { type: "add"; task: Task }
  | { type: "toggle"; id: string; updatedAt: string }
  | { type: "updateTitle"; id: string; title: string; updatedAt: string }
  | {
      type: "updatePriority";
      id: string;
      priority: TaskPriority;
      updatedAt: string;
    }
  | {
      type: "updateScheduledDate";
      id: string;
      scheduledDate: string;
      updatedAt: string;
    }
  | {
      type: "updateReminder";
      id: string;
      remindAt: string | null;
      updatedAt: string;
    }
  | { type: "markReminderSent"; id: string; reminderSentAt: string }
  | { type: "remove"; id: string };

export function taskReducer(tasks: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "replace":
      return action.tasks;
    case "add":
      return [...tasks, action.task];
    case "toggle":
      return tasks.map((task) =>
        task.id === action.id
          ? { ...task, completed: !task.completed, updatedAt: action.updatedAt }
          : task,
      );
    case "updateTitle":
      return tasks.map((task) =>
        task.id === action.id
          ? { ...task, title: action.title.trim(), updatedAt: action.updatedAt }
          : task,
      );
    case "updatePriority":
      return tasks.map((task) =>
        task.id === action.id
          ? { ...task, priority: action.priority, updatedAt: action.updatedAt }
          : task,
      );
    case "updateScheduledDate":
      return tasks.map((task) =>
        task.id === action.id
          ? { ...task, scheduledDate: action.scheduledDate, updatedAt: action.updatedAt }
          : task,
      );
    case "updateReminder":
      return tasks.map((task) =>
        task.id === action.id
          ? {
              ...task,
              remindAt: action.remindAt,
              reminderSentAt: null,
              updatedAt: action.updatedAt,
            }
          : task,
      );
    case "markReminderSent":
      return tasks.map((task) =>
        task.id === action.id
          ? { ...task, reminderSentAt: action.reminderSentAt }
          : task,
      );
    case "remove":
      return tasks.filter((task) => task.id !== action.id);
  }
}

export function getTasksForDate(tasks: Task[], scheduledDate: string): Task[] {
  return tasks.filter((task) => task.scheduledDate === scheduledDate);
}
