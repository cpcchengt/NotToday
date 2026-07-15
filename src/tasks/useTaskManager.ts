import { useEffect, useReducer, useState } from "react";

import { createTask, getDateKey, type TaskPriority } from "./task";
import {
  canSendTaskReminder,
  scheduleTaskReminders,
  sendTaskReminder,
} from "./taskReminderService";
import { taskRepository } from "./taskRepository";
import { getTasksForDate, taskReducer } from "./taskReducer";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "任务操作失败。请稍后重试。";
}

export function useTaskManager() {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = getDateKey(new Date());
  const todayTasks = getTasksForDate(tasks, today);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      setIsLoading(true);
      setError(null);

      try {
        const loadedTasks = await taskRepository.loadToday(today);
        if (!cancelled) dispatch({ type: "replace", tasks: loadedTasks });
      } catch (loadError) {
        if (!cancelled) setError(errorMessage(loadError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, [today]);

  useEffect(() => {
    return scheduleTaskReminders(todayTasks, (task) => {
      void (async () => {
        try {
          if (!(await canSendTaskReminder())) return;

          const reminderSentAt = new Date().toISOString();
          await taskRepository.markReminderSent(task.id, reminderSentAt);
          dispatch({ type: "markReminderSent", id: task.id, reminderSentAt });
          sendTaskReminder(task);
        } catch (reminderError) {
          setError(errorMessage(reminderError));
        }
      })();
    });
  }, [todayTasks]);

  async function runTaskAction(action: () => Promise<void>): Promise<boolean> {
    setError(null);

    try {
      await action();
      return true;
    } catch (actionError) {
      setError(errorMessage(actionError));
      return false;
    }
  }

  return {
    todayTasks,
    isLoading,
    error,
    addTask: async (input: {
      title: string;
      priority: TaskPriority;
      remindAt: string | null;
      scheduledDate: string;
    }) => {
      const now = new Date().toISOString();
      const task = createTask({
        id: crypto.randomUUID(),
        title: input.title,
        priority: input.priority,
        scheduledDate: input.scheduledDate,
        remindAt: input.remindAt
          ? new Date(input.remindAt).toISOString()
          : null,
        now,
      });

      return runTaskAction(async () => {
        await taskRepository.create(task);
        dispatch({ type: "add", task });
      });
    },
    toggleTask: async (id: string) => {
      const task = tasks.find((item) => item.id === id);
      if (!task) return;

      const updatedAt = new Date().toISOString();
      const completed = !task.completed;

      await runTaskAction(async () => {
        await taskRepository.updateCompletion(id, completed, updatedAt);
        dispatch({ type: "toggle", id, updatedAt });
      });
    },
    updateTaskTitle: async (id: string, title: string) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) return;

      const updatedAt = new Date().toISOString();
      await runTaskAction(async () => {
        await taskRepository.updateTitle(id, trimmedTitle, updatedAt);
        dispatch({ type: "updateTitle", id, title: trimmedTitle, updatedAt });
      });
    },
    updateTaskPriority: async (id: string, priority: TaskPriority) => {
      const updatedAt = new Date().toISOString();
      await runTaskAction(async () => {
        await taskRepository.updatePriority(id, priority, updatedAt);
        dispatch({ type: "updatePriority", id, priority, updatedAt });
      });
    },
    updateTaskScheduledDate: async (id: string, scheduledDate: string) => {
      const updatedAt = new Date().toISOString();
      await runTaskAction(async () => {
        await taskRepository.updateScheduledDate(id, scheduledDate, updatedAt);
        dispatch({ type: "updateScheduledDate", id, scheduledDate, updatedAt });
      });
    },
    updateTaskReminder: async (id: string, remindAt: string | null) => {
      const updatedAt = new Date().toISOString();
      const normalizedReminder = remindAt
        ? new Date(remindAt).toISOString()
        : null;

      await runTaskAction(async () => {
        await taskRepository.updateReminder(id, normalizedReminder, updatedAt);
        dispatch({
          type: "updateReminder",
          id,
          remindAt: normalizedReminder,
          updatedAt,
        });
      });
    },
    removeTask: async (id: string) => {
      await runTaskAction(async () => {
        await taskRepository.remove(id);
        dispatch({ type: "remove", id });
      });
    },
  };
}
