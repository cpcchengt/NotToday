import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Clock3, Ellipsis, X } from "lucide-react";

import {
  toDateTimeLocalValue,
  type Task,
  type TaskPriority,
} from "../tasks/task";
import { TaskFormOptions } from "./AddTaskButton";

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
  onUpdateScheduledDate: (id: string, scheduledDate: string) => Promise<void>;
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
  onUpdateScheduledDate,
  onRemove,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editFormRef = useRef<HTMLFormElement>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const priorityMenuRef = useRef<HTMLDivElement>(null);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftPriority, setDraftPriority] = useState(task.priority);
  const [draftScheduledDate, setDraftScheduledDate] = useState(task.scheduledDate);
  const [draftTime, setDraftTime] = useState(() => toDateTimeLocalValue(task.remindAt).slice(11, 16) || "16:00");
  const [shouldRemind, setShouldRemind] = useState(Boolean(task.remindAt));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPriorityMenuOpen) return;

    function closePriorityMenu(event: PointerEvent) {
      if (!priorityMenuRef.current?.contains(event.target as Node)) {
        setIsPriorityMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closePriorityMenu);
    return () => document.removeEventListener("pointerdown", closePriorityMenu);
  }, [isPriorityMenuOpen]);
  useEffect(() => {
    if (!isEditing) return;

    function cancelWhenClickingOutside(event: PointerEvent) {
      if (editFormRef.current?.contains(event.target as Node)) return;

      setDraftTitle(task.title);
      setDraftPriority(task.priority);
      setDraftScheduledDate(task.scheduledDate);
      setDraftTime(toDateTimeLocalValue(task.remindAt).slice(11, 16) || "16:00");
      setShouldRemind(Boolean(task.remindAt));
      setError("");
      setIsEditing(false);
    }

    document.addEventListener("pointerdown", cancelWhenClickingOutside);
    return () => document.removeEventListener("pointerdown", cancelWhenClickingOutside);
  }, [isEditing, task]);
  function cancelEditing() {
    setDraftTitle(task.title);
    setDraftPriority(task.priority);
    setDraftScheduledDate(task.scheduledDate);
    setDraftTime(toDateTimeLocalValue(task.remindAt).slice(11, 16) || "16:00");
    setShouldRemind(Boolean(task.remindAt));
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
    if (draftPriority !== task.priority) {
      await onUpdatePriority(task.id, draftPriority);
    }
    if (draftScheduledDate !== task.scheduledDate) {
      await onUpdateScheduledDate(task.id, draftScheduledDate);
    }
    const nextReminder = shouldRemind ? `${draftScheduledDate}T${draftTime}` : null;
    if (nextReminder !== toDateTimeLocalValue(task.remindAt)) {
      await onUpdateReminder(task.id, nextReminder);
    }
    setIsEditing(false);
  }

  return (
    <li
      className={isEditing ? "relative w-full overflow-visible" : `relative overflow-visible rounded-sm border border-l-4 border-stone-200 bg-white/85 shadow-[0_6px_14px_rgba(77,59,43,0.03)] ${priorityBorders[task.priority]} dark:border-stone-800 dark:bg-stone-900`}
    >
      <div className={isEditing ? "w-full" : "flex min-h-[84px] items-start gap-3 px-4 py-3"}>
        <label
          className={
            isEditing ? "hidden" : task.completed
              ? "grid size-6 shrink-0 self-center cursor-pointer place-items-center rounded-full border-2 border-[#90896d] bg-[#90896d] text-white"
              : "grid size-6 shrink-0 self-center cursor-pointer place-items-center rounded-full border-2 border-stone-300 text-white transition-colors hover:border-stone-500 dark:border-stone-600"
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
            <form className="add-task-form w-full rounded-2xl border border-stone-200 bg-[#fdfaf7] p-3 shadow-[0_8px_20px_rgba(78,58,44,0.08)] dark:border-stone-700 dark:bg-stone-900" onSubmit={saveTitle} ref={editFormRef}>
              <div className="relative">
                <textarea aria-describedby={error ? `task-error-${task.id}` : undefined} autoFocus className="min-h-[60px] w-full resize-none rounded-lg border border-[#dd8f88] bg-white px-3 py-2.5 pr-9 text-xs text-stone-800 outline-none placeholder:text-stone-400 focus:border-[#b73a2f] dark:bg-stone-950 dark:text-stone-100" onChange={(event) => { setDraftTitle(event.target.value); if (error) setError(""); }} rows={2} value={draftTitle} />
                <button aria-label="清空任务标题" className="absolute right-1 top-1 grid size-8 place-items-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200" onClick={() => setDraftTitle("")} type="button"><X size={14} strokeWidth={1.8} /></button>
              </div>
              {error ? <p className="mt-1 text-xs text-red-700 dark:text-red-300" id={`task-error-${task.id}`}>{error}</p> : null}
              <TaskFormOptions
                onPriorityChange={setDraftPriority}
                onScheduledDateChange={setDraftScheduledDate}
                onShouldRemindChange={setShouldRemind}
                onTimeChange={setDraftTime}
                priority={draftPriority}
                scheduledDate={draftScheduledDate}
                shouldRemind={shouldRemind}
                time={draftTime}
              />
              <div className="mt-3 flex items-center justify-between">
                <button className="rounded-lg px-2 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" onClick={cancelEditing} type="button">取消</button>
                <button className="rounded-lg bg-stone-800 px-5 py-2 text-xs text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300" type="submit">保存任务</button>
              </div>
            </form>
          ) : (
            <>
              <p className={
            isEditing ? "hidden" : task.completed ? "text-[15px] text-stone-400 line-through dark:text-stone-500" : "text-[15px] text-stone-700 dark:text-stone-200"}>
                {task.title}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="relative" ref={priorityMenuRef}>
                  <button
                    aria-expanded={isPriorityMenuOpen}
                    aria-label={`${task.title} 的优先级`}
                    className={`inline-flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-medium leading-none outline-none transition-colors hover:brightness-95 ${priorityClasses[task.priority]}`}
                    onClick={() => setIsPriorityMenuOpen((isOpen) => !isOpen)}
                    type="button"
                  >
                    {task.priority === "low" ? "低优先级" : task.priority === "medium" ? "中优先级" : "高优先级"}
                    <ChevronDown size={11} />
                  </button>
                  {isPriorityMenuOpen ? (
                    <div className="absolute left-0 top-7 z-20 w-28 rounded-xl border border-stone-200 bg-white p-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
                      {(["low", "medium", "high"] as const).map((priority) => (
                        <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[10px] font-medium leading-none text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800" key={priority} onClick={() => { void onUpdatePriority(task.id, priority); setIsPriorityMenuOpen(false); }} type="button">
                          {priority === "low" ? "低优先级" : priority === "medium" ? "中优先级" : "高优先级"}
                          {task.priority === priority ? <Check size={12} /> : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
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
          <div className="relative shrink-0 self-center">
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
