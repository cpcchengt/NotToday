import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import type { Task } from "./task";

export function scheduleTaskReminders(
  tasks: Task[],
  onDue: (task: Task) => void,
): () => void {
  const timers = tasks.flatMap((task) => {
    if (task.completed || !task.remindAt || task.reminderSentAt) return [];

    const delay = Math.max(0, new Date(task.remindAt).getTime() - Date.now());
    return [window.setTimeout(() => onDue(task), delay)];
  });

  return () => timers.forEach((timer) => window.clearTimeout(timer));
}

export async function canSendTaskReminder(): Promise<boolean> {
  let permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    permissionGranted = (await requestPermission()) === "granted";
  }

  return permissionGranted;
}

export function sendTaskReminder(task: Task) {
  sendNotification({ title: "NotToday", body: `提醒：${task.title}` });
}
