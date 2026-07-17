import Database from "@tauri-apps/plugin-sql";

import type { Task, TaskPriority } from "./task";

const DATABASE_URL = "sqlite:nottoday.db";

type TaskRow = {
  id: string;
  title: string;
  completed: number | boolean;
  completed_at: string | null;
  priority: TaskPriority;
  scheduled_date: string | null;
  scheduled_time: string | null;
  remind_at: string | null;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export class TaskRepositoryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TaskRepositoryError";
  }
}

let databasePromise: Promise<Database> | undefined;

async function getDatabase(): Promise<Database> {
  if (!databasePromise) {
    databasePromise = Database.load(DATABASE_URL).catch((error: unknown) => {
      databasePromise = undefined;
      throw new TaskRepositoryError(
        "无法打开本地任务数据库。请重启应用后重试。",
        {
          cause: error,
        },
      );
    });
  }

  return databasePromise;
}

function toTask(row: TaskRow): Task {
  const reminderTime = row.remind_at
    ? new Date(row.remind_at).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  return {
    id: row.id,
    title: row.title,
    completed: row.completed === true || row.completed === 1,
    completedAt: row.completed_at,
    priority: row.priority,
    scheduledDate: row.scheduled_date ?? "",
    scheduledTime: row.scheduled_time ?? reminderTime ?? "16:00",
    remindAt: row.remind_at,
    reminderSentAt: row.reminder_sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function databaseFailure(action: string, error: unknown): TaskRepositoryError {
  if (error instanceof TaskRepositoryError) return error;

  return new TaskRepositoryError(`${action}失败。请稍后重试。`, {
    cause: error,
  });
}

async function executeUpdate(
  query: string,
  values: unknown[],
  failureMessage: string,
) {
  try {
    const database = await getDatabase();
    const result = await database.execute(query, values);

    if (result.rowsAffected === 0) {
      throw new TaskRepositoryError("未找到要更新的任务。请刷新后重试。");
    }
  } catch (error) {
    throw databaseFailure(failureMessage, error);
  }
}

export const taskRepository = {
  async loadAll(): Promise<Task[]> {
    try {
      const database = await getDatabase();
      const rows = await database.select<TaskRow[]>(
        `SELECT id, title, completed, completed_at, priority, scheduled_date, scheduled_time, remind_at, reminder_sent_at, created_at, updated_at
         FROM tasks
         ORDER BY scheduled_date ASC, created_at ASC`,
      );

      return rows.map(toTask);
    } catch (error) {
      throw databaseFailure("加载任务", error);
    }
  },

  async loadToday(scheduledDate: string): Promise<Task[]> {
    try {
      const database = await getDatabase();
      const rows = await database.select<TaskRow[]>(
        `SELECT id, title, completed, completed_at, priority, scheduled_date, scheduled_time, remind_at, reminder_sent_at, created_at, updated_at
         FROM tasks
         WHERE scheduled_date = $1
         ORDER BY created_at ASC`,
        [scheduledDate],
      );

      return rows.map(toTask);
    } catch (error) {
      throw databaseFailure("加载今天的任务", error);
    }
  },

  async create(task: Task): Promise<void> {
    await executeUpdate(
      `INSERT INTO tasks (
        id, title, completed, completed_at, priority, scheduled_date, scheduled_time, remind_at, reminder_sent_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        task.id,
        task.title,
        task.completed ? 1 : 0,
        task.completedAt,
        task.priority,
        task.scheduledDate,
        task.scheduledTime,
        task.remindAt,
        task.reminderSentAt,
        task.createdAt,
        task.updatedAt,
      ],
      "保存任务",
    );
  },

  async updateCompletion(
    id: string,
    completed: boolean,
    completedAt: string | null,
    updatedAt: string,
  ): Promise<void> {
    await executeUpdate(
      "UPDATE tasks SET completed = $1, completed_at = $2, updated_at = $3 WHERE id = $4",
      [completed ? 1 : 0, completedAt, updatedAt, id],
      "更新任务完成状态",
    );
  },

  async updateTitle(
    id: string,
    title: string,
    updatedAt: string,
  ): Promise<void> {
    await executeUpdate(
      "UPDATE tasks SET title = $1, updated_at = $2 WHERE id = $3",
      [title, updatedAt, id],
      "更新任务标题",
    );
  },

  async updatePriority(
    id: string,
    priority: TaskPriority,
    updatedAt: string,
  ): Promise<void> {
    await executeUpdate(
      "UPDATE tasks SET priority = $1, updated_at = $2 WHERE id = $3",
      [priority, updatedAt, id],
      "更新任务优先级",
    );
  },

  async updateScheduledDate(
    id: string,
    scheduledDate: string,
    updatedAt: string,
  ): Promise<void> {
    await executeUpdate(
      "UPDATE tasks SET scheduled_date = $1, updated_at = $2 WHERE id = $3",
      [scheduledDate, updatedAt, id],
      "更新任务日期",
    );
  },

  async updateReminder(
    id: string,
    remindAt: string | null,
    scheduledTime: string,
    updatedAt: string,
  ): Promise<void> {
    await executeUpdate(
      "UPDATE tasks SET scheduled_time = $1, remind_at = $2, reminder_sent_at = NULL, updated_at = $3 WHERE id = $4",
      [scheduledTime, remindAt, updatedAt, id],
      "更新任务提醒",
    );
  },

  async markReminderSent(id: string, reminderSentAt: string): Promise<void> {
    await executeUpdate(
      "UPDATE tasks SET reminder_sent_at = $1 WHERE id = $2 AND reminder_sent_at IS NULL",
      [reminderSentAt, id],
      "记录任务提醒",
    );
  },

  async remove(id: string): Promise<void> {
    await executeUpdate("DELETE FROM tasks WHERE id = $1", [id], "删除任务");
  },
};
