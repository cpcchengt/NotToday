import { Sun } from "lucide-react";

import { getDateKey, type Task, type TaskPriority } from "../tasks/task";
import backgroundIllustration from "../assets/background.png";

import { TaskItem } from "./TaskItem";

type TodayTasksProps = {
  currentDate: Date;
  tasks: Task[];
  onToggle: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
  onUpdatePriority: (id: string, priority: TaskPriority) => Promise<void>;
  onUpdateReminder: (
    id: string,
    remindAt: string | null,
    scheduledTime: string,
  ) => Promise<void>;
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
const prioritySortOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function isCompletedToday(task: Task, todayKey: string) {
  if (!task.completed) return true;
  if (!task.completedAt) return false;

  return getDateKey(new Date(task.completedAt)) === todayKey;
}

function getTaskSortTime(task: Task) {
  if (task.remindAt) return new Date(task.remindAt).getTime();

  return new Date(`${task.scheduledDate}T${task.scheduledTime}`).getTime();
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((first, second) => {
    const priorityDiff =
      prioritySortOrder[first.priority] - prioritySortOrder[second.priority];

    if (priorityDiff !== 0) return priorityDiff;

    const timeDiff = getTaskSortTime(first) - getTaskSortTime(second);
    if (timeDiff !== 0) return timeDiff;

    return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
  });
}

type TaskSectionProps = {
  label: string;
  tasks: Task[];
  children?: React.ReactNode;
};

function TaskSection({ label, tasks, children }: TaskSectionProps) {
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-base text-stone-700 dark:text-stone-200">
          <span className="h-5 w-1 rounded-full bg-[#b73a2f]" />
          <h2>{label}</h2>
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
      {children}
    </section>
  );
}

export function TodayTasks({
  currentDate,
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
  const todayKey = getDateKey(currentDate);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    currentDate,
  );
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(currentDate);
  const lunarDate = formatChineseLunarDate(currentDate);
  const visibleTasks = tasks.filter((task) => isCompletedToday(task, todayKey));
  const pastTasks = sortTasks(
    visibleTasks.filter((task) => task.scheduledDate < todayKey),
  );
  const todayTasks = sortTasks(
    visibleTasks.filter((task) => task.scheduledDate === todayKey),
  );
  const futureTasks = sortTasks(
    visibleTasks.filter((task) => task.scheduledDate > todayKey),
  );

  function renderTaskList(sectionTasks: Task[], label: string) {
    return (
      <ul className="mt-4 space-y-3 pb-1" aria-label={`${label}的任务`}>
        {sectionTasks.map((task) => (
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
    );
  }

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

        <aside className="relative min-h-36 overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white/60 px-5 py-4 shadow-[0_16px_36px_rgba(89,70,53,0.14)] dark:border-stone-800 dark:bg-stone-900 dark:shadow-[0_16px_36px_rgba(0,0,0,0.32)]">
          <span
            aria-hidden="true"
            className="block h-6 font-serif text-[48px] font-normal leading-none text-[#b73a2f]"
          >
            “
          </span>
          <p className="mt-3 text-[15px] font-normal tracking-wide text-stone-700 dark:text-stone-200">
            今天只需要赢三次。
          </p>
          <p className="mt-1 text-xs font-normal text-stone-400 dark:text-stone-500">
            Three wins are enough.
          </p>
          <img
            aria-hidden="true"
            alt=""
            className="pointer-events-none absolute -bottom-5 -right-4 w-36 select-none object-contain opacity-95"
            src={backgroundIllustration}
          />
        </aside>
      </div>

      {error ? (
        <p
          className="mt-7 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="scrollbar-hidden mt-7 min-h-0 flex-1 space-y-6 overflow-y-auto">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
            正在加载任务…
          </div>
        ) : (
          <>
            {pastTasks.length > 0 ? (
              <TaskSection label="过去" tasks={pastTasks}>
                {renderTaskList(pastTasks, "过去")}
              </TaskSection>
            ) : null}

            <TaskSection label="今天" tasks={todayTasks}>
              {todayTasks.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white/45 px-4 py-8 text-center dark:border-stone-700 dark:bg-stone-900/60">
                  <p className="text-sm">今天还没有任务</p>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    从下方写下第一件要完成的事。
                  </p>
                </div>
              ) : (
                renderTaskList(todayTasks, "今天")
              )}
            </TaskSection>

            {futureTasks.length > 0 ? (
              <TaskSection label="未来" tasks={futureTasks}>
                {renderTaskList(futureTasks, "未来")}
              </TaskSection>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
