import { useState } from "react";
import { Check, Clock3, Ellipsis } from "lucide-react";

import {
  toDateTimeLocalValue,
  type Task,
  type TaskPriority,
} from "../tasks/task";

const priorityClasses: Record<TaskPriority, string> = {
  low: "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-300",
  medium: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300",
  high: "bg-red-100 text-[#b73a2f] dark:bg-red-950 dark:text-red-300",
};

const priorityBorders: Record<TaskPriority, string> = {
  low: "border-l-stone-400 dark:border-l-stone-500",
  medium: "border-l-orange-400 dark:border-l-orange-400",
  high: "border-l-[#b73a2f] dark:border-l-[#b73a2f]",
};

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
  onUpdatePriority: (id: string, priority: TaskPriority) => Promise<void>;
  onUpdateReminder: (id: string, remindAt: string | null) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};

function formatReminder(remindAt: string) {
  const reminderDate = new Date(remindAt);
  const isToday = reminderDate.toDateString() === new Date().toDateString();
  const time = reminderDate.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return isToday ? `今天 ${time}` : `${reminderDate.toLocaleDateString("zh-CN")} ${time}`;
}

export function TaskItem({
  task,
  onToggle,
  onUpdateTitle,
  onUpdatePriority,
  onUpdateReminder,
  onRemove,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftRemindAt, setDraftRemindAt] = useState(
    toDateTimeLocalValue(task.remindAt),
  );
  const [error, setError] = useState("");

  function cancelEditing() {
    setDraftTitle(task.title);
    setDraftRemindAt(toDateTimeLocalValue(task.remindAt));
    setError("");
    setIsEditing(false);
  }

  async function saveTitle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draftTitle.trim()) {
      setError("任务标题不能为空。");
      return;
    }

    await onUpdateTitle(task.id, draftTitle);
    if (draftRemindAt !== toDateTimeLocalValue(task.remindAt)) {
      await onUpdateReminder(task.id, draftRemindAt || null);
    }
    setIsEditing(false);
  }

  return (
    <li
      className={`relative overflow-visible rounded-sm border border-l-4 border-stone-200 bg-white/85 shadow-[0_6px_14px_rgba(77,59,43,0.03)] ${priorityBorders[task.priority]} dark:border-stone-800 dark:bg-stone-900`}
    >
      <div className="flex min-h-[84px] items-start gap-3 px-4 py-3">
        <label
          className={
            task.completed
              ? "mt-1.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-[#90896d] bg-[#90896d] text-white"
              : "mt-1.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-stone-300 text-white transition-colors hover:border-stone-500 dark:border-stone-600"
          }
        >
          <input
            aria-label={`完成：${task.title}`}
            checked={task.completed}
            className="sr-only"
            onChange={() => void onToggle(task.id)}
            type="checkbox"
          />
          {task.completed ? <Check size={15} strokeWidth={2.5} /> : null}
        </label>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <form className="space-y-2" onSubmit={saveTitle}>
              <input
                aria-describedby={error ? `task-error-${task.id}` : undefined}
                autoFocus
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#b73a2f] dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                onChange={(event) => {
                  setDraftTitle(event.target.value);
                  if (error) setError("");
                }}
                value={draftTitle}
              />
              <label className="block text-xs text-stone-600 dark:text-stone-300">
                提醒时间（可选）
                <input
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#b73a2f] dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                  onChange={(event) => setDraftRemindAt(event.target.value)}
                  type="datetime-local"
                  value={draftRemindAt}
                />
              </label>
              {error ? (
                <p className="text-xs text-red-700 dark:text-red-300" id={`task-error-${task.id}`}>
                  {error}
                </p>
              ) : null}
              <div className="flex gap-2">
                <button className="rounded-lg bg-stone-800 px-3 py-1.5 text-xs text-white" type="submit">
                  保存
                </button>
                <button className="rounded-lg px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" onClick={cancelEditing} type="button">
                  取消
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className={task.completed ? "text-[15px] text-stone-400 line-through dark:text-stone-500" : "text-[15px] text-stone-700 dark:text-stone-200"}>
                {task.title}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  aria-label={`${task.title} 的优先级`}
                  className={`appearance-none rounded-full px-3 py-1 text-xs outline-none ${priorityClasses[task.priority]}`}
                  onChange={(event) => void onUpdatePriority(task.id, event.target.value as TaskPriority)}
                  value={task.priority}
                >
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                </select>
                {task.remindAt ? (
                  <span className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                    <Clock3 size={15} strokeWidth={1.8} />
                    {formatReminder(task.remindAt)}
                  </span>
                ) : null}
              </div>
            </>
          )}
        </div>
        {!isEditing ? (
          <div className="relative shrink-0">
            <button
              aria-expanded={isActionsOpen}
              aria-label={`${task.title} 的更多操作`}
              className="grid size-8 place-items-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              onClick={() => setIsActionsOpen((isOpen) => !isOpen)}
              type="button"
            >
              <Ellipsis size={20} strokeWidth={2.2} />
            </button>
            {isActionsOpen ? (
              <div className="absolute right-0 top-9 z-10 w-24 rounded-xl border border-stone-200 bg-white p-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
                <button className="w-full rounded-lg px-2 py-1.5 text-left text-xs hover:bg-stone-100 dark:hover:bg-stone-800" onClick={() => { setIsEditing(true); setIsActionsOpen(false); }} type="button">
                  编辑
                </button>
                <button className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950" onClick={() => { setIsConfirmingDelete(true); setIsActionsOpen(false); }} type="button">
                  删除
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {isConfirmingDelete ? (
        <div className="flex items-center justify-between gap-2 border-t border-stone-100 px-4 py-3 text-xs dark:border-stone-800">
          <span className="text-stone-600 dark:text-stone-300">确认删除这项任务？</span>
          <div className="flex gap-1">
            <button className="rounded-lg px-2 py-1 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" onClick={() => setIsConfirmingDelete(false)} type="button">
              取消
            </button>
            <button className="rounded-lg bg-[#b73a2f] px-2 py-1 text-white hover:bg-[#963027]" onClick={() => void onRemove(task.id)} type="button">
              删除
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
