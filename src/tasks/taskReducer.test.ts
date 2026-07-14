import { describe, expect, it } from "vitest";

import { createTask, getDateKey } from "./task";
import { getTasksForDate, taskReducer } from "./taskReducer";

const now = "2026-07-14T08:00:00.000Z";
const today = "2026-07-14";

function makeTask(id = "task-1") {
  return createTask({
    id,
    title: "  写任务测试  ",
    priority: "medium",
    scheduledDate: today,
    now,
  });
}

describe("taskReducer", () => {
  it("adds a task with a trimmed title", () => {
    const task = makeTask();
    const tasks = taskReducer([], { type: "add", task });

    expect(tasks).toEqual([expect.objectContaining({ title: "写任务测试" })]);
  });

  it("toggles completion and tracks the update timestamp", () => {
    const task = makeTask();
    const tasks = taskReducer([task], {
      type: "toggle",
      id: task.id,
      updatedAt: "2026-07-14T09:00:00.000Z",
    });

    expect(tasks[0]).toMatchObject({
      completed: true,
      updatedAt: "2026-07-14T09:00:00.000Z",
    });
  });

  it("updates a title and removes a task", () => {
    const task = makeTask();
    const renamed = taskReducer([task], {
      type: "updateTitle",
      id: task.id,
      title: "  已修改标题  ",
      updatedAt: "2026-07-14T10:00:00.000Z",
    });
    const removed = taskReducer(renamed, { type: "remove", id: task.id });

    expect(renamed[0]).toMatchObject({ title: "已修改标题" });
    expect(removed).toEqual([]);
  });
});

describe("task helpers", () => {
  it("returns only tasks scheduled for the requested date", () => {
    const todayTask = makeTask("today");
    const tomorrowTask = {
      ...makeTask("tomorrow"),
      scheduledDate: "2026-07-15",
    };

    expect(getTasksForDate([todayTask, tomorrowTask], today)).toEqual([
      todayTask,
    ]);
  });

  it("creates a local calendar date key", () => {
    expect(getDateKey(new Date(2026, 6, 14))).toBe("2026-07-14");
  });

  it("rejects an empty title", () => {
    expect(() =>
      createTask({
        id: "empty",
        title: "   ",
        priority: "low",
        scheduledDate: today,
        now,
      }),
    ).toThrow("Task title cannot be empty.");
  });
});
