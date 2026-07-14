import { FlagTriangleRight, Mountain, Quote, Sun } from "lucide-react";

import type { Task, TaskPriority } from "../tasks/task";

import { TaskItem } from "./TaskItem";

type TodayTasksProps = {
  tasks: Task[];
  onToggle: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
  onUpdatePriority: (id: string, priority: TaskPriority) => Promise<void>;
  onUpdateReminder: (id: string, remindAt: string | null) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const today = new Date();
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
  today,
);
const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
}).format(today);

export function TodayTasks({
  tasks,
  onToggle,
  onUpdateTitle,
  onUpdatePriority,
  onUpdateReminder,
  onRemove,
  isLoading,
  error,
}: TodayTasksProps) {
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-4 pt-3">
      <div className="grid gap-4 min-[420px]:grid-cols-[minmax(0,0.88fr)_minmax(0,1fr)] min-[420px]:items-center">
        <div className="px-1 py-2">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {weekday}
          </p>
          <h1 className="date-display mt-1 tracking-[-0.06em] text-stone-800 dark:text-stone-100">
            {date}
          </h1>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-300">
            <Sun className="text-amber-500" size={14} strokeWidth={1.8} />
            专注今天
          </span>
        </div>

        <aside className="relative min-h-36 overflow-hidden rounded-[1.65rem] border border-stone-200 bg-white/60 px-5 py-4 shadow-[0_10px_24px_rgba(89,70,53,0.05)] dark:border-stone-800 dark:bg-stone-900">
          <Quote className="text-[#b73a2f]" fill="currentColor" size={27} />
          <p className="mt-3 text-[15px] tracking-wide text-stone-700 dark:text-stone-200">
            今天只需要赢三次。
          </p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            Three wins are enough.
          </p>
          <Mountain
            aria-hidden="true"
            className="absolute -bottom-4 right-3 text-stone-200 dark:text-stone-700"
            size={86}
            strokeWidth={1}
          />
          <FlagTriangleRight
            aria-hidden="true"
            className="absolute bottom-9 right-10 text-[#b73a2f]"
            fill="currentColor"
            size={15}
          />
        </aside>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <div className="flex items-center gap-2 text-base text-stone-700 dark:text-stone-200">
          <span className="h-5 w-1 rounded-full bg-[#b73a2f]" />
          <h2>今天</h2>
          <span className="text-stone-500 dark:text-stone-400">
            · {tasks.length} 项任务
          </span>
        </div>
        <span className="text-sm text-stone-500 dark:text-stone-400">
          <strong className="font-normal text-[#b73a2f]">{completedCount}/{tasks.length}</strong>{" "}
          完成
        </span>
      </div>

      {error ? (
        <p
          className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-4 rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
          正在加载今天的任务…
        </div>
      ) : tasks.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white/45 px-4 py-8 text-center dark:border-stone-700 dark:bg-stone-900/60">
          <p className="text-sm">今天还没有任务</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            从下方写下第一件要完成的事。
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3" aria-label="今天的任务">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              onRemove={onRemove}
              onToggle={onToggle}
              onUpdatePriority={onUpdatePriority}
              onUpdateReminder={onUpdateReminder}
              onUpdateTitle={onUpdateTitle}
              task={task}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
