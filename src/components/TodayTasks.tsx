import { FlagTriangleRight, Mountain, Quote, Sun } from "lucide-react";

import type { Task, TaskPriority } from "../tasks/task";

import { TaskItem } from "./TaskItem";

type TodayTasksProps = {
  tasks: Task[];
  onToggle: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
  onUpdatePriority: (id: string, priority: TaskPriority) => Promise<void>;
  onUpdateReminder: (id: string, remindAt: string | null) => Promise<void>;
  onUpdateScheduledDate: (id: string, scheduledDate: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const chineseNumerals = [
  "",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
];

function formatChineseLunarDay(day: number) {
  if (day <= 10) {
    return `初${chineseNumerals[day]}`;
  }

  if (day < 20) {
    return `十${chineseNumerals[day - 10]}`;
  }

  if (day === 20) {
    return "二十";
  }

  if (day < 30) {
    return `廿${chineseNumerals[day - 20]}`;
  }

  return "三十";
}

export function formatChineseLunarDate(value: Date) {
  const parts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    month: "long",
    day: "numeric",
  }).formatToParts(value);

  const month = parts.find((part) => part.type === "month")?.value;
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!month || !Number.isInteger(day) || day < 1 || day > 30) {
    return `农历${parts.map((part) => part.value).join("")}`;
  }

  return `农历${month}${formatChineseLunarDay(day)}`;
}
const today = new Date();
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
  today,
);
const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
}).format(today);
const lunarDate = formatChineseLunarDate(today);

export function TodayTasks({
  tasks,
  onToggle,
  onUpdateTitle,
  onUpdatePriority,
  onUpdateReminder,
  onUpdateScheduledDate,
  onRemove,
  isLoading,
  error,
}: TodayTasksProps) {
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <section className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-3">
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
            {lunarDate}
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
          <strong className="font-medium text-[#b73a2f]">
            {completedCount}/{tasks.length}
          </strong>{" "}
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

      <div className="scrollbar-hidden mt-4 min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
            正在加载今天的任务…
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/45 px-4 py-8 text-center dark:border-stone-700 dark:bg-stone-900/60">
            <p className="text-sm">今天还没有任务</p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              从下方写下第一件要完成的事。
            </p>
          </div>
        ) : (
          <ul className="space-y-3 pb-1" aria-label="今天的任务">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                onRemove={onRemove}
                onToggle={onToggle}
                onUpdatePriority={onUpdatePriority}
                onUpdateReminder={onUpdateReminder}
                onUpdateScheduledDate={onUpdateScheduledDate}
                onUpdateTitle={onUpdateTitle}
                task={task}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
