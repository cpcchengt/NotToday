import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Flag,
  Plus,
  X,
} from "lucide-react";

import type { TaskPriority } from "../tasks/task";

type AddTaskButtonProps = {
  onAdd: (input: {
    title: string;
    priority: TaskPriority;
    remindAt: string | null;
    scheduledDate: string;
    scheduledTime: string;
  }) => Promise<boolean>;
};

type OpenPicker = "date" | "priority" | "reminder" | "time" | null;
type PickerPlacement = "above" | "below";

const priorityOptions: Array<{
  value: TaskPriority;
  label: string;
}> = [
  { value: "low", label: "低优先级" },
  { value: "medium", label: "中优先级" },
  { value: "high", label: "高优先级" },
];

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatScheduledDate(value: string) {
  const selected = fromDateKey(value);
  const today = toDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (value === today) return "今天";
  if (value === toDateKey(tomorrow)) return "明天";
  return `${selected.getMonth() + 1}月${selected.getDate()}日`;
}

function isSameDate(first: Date, second: Date) {
  return toDateKey(first) === toDateKey(second);
}

function reminderDateTime(date: string, time: string) {
  return `${date}T${time}`;
}

type CalendarPickerProps = {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  placement?: PickerPlacement;
};

type TimePickerProps = {
  value: string;
  onSelect: (time: string) => void;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  placement?: PickerPlacement;
};

type FloatingPickerPanelProps = {
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className: string;
  picker: Exclude<OpenPicker, "priority" | "reminder" | null>;
  placement: PickerPlacement;
  width: number;
};

function FloatingPickerPanel({
  anchorRef,
  children,
  className,
  picker,
  placement,
  width,
}: FloatingPickerPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    function updatePosition() {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const anchorRect = anchor.getBoundingClientRect();
      const panelHeight = panelRef.current?.offsetHeight ?? 0;
      const viewportPadding = 8;
      const gap = 8;
      const left = Math.min(
        window.innerWidth - width - viewportPadding,
        Math.max(viewportPadding, anchorRect.right - width),
      );
      const preferredTop =
        placement === "below"
          ? anchorRect.bottom + gap
          : anchorRect.top - panelHeight - gap;
      const top = Math.min(
        window.innerHeight - viewportPadding - panelHeight,
        Math.max(viewportPadding, preferredTop),
      );

      setStyle({ left, position: "fixed", top, width, zIndex: 1000 });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, placement, width]);

  return createPortal(
    <div
      className={className}
      data-task-picker-portal="true"
      data-task-picker-type={picker}
      ref={panelRef}
      style={style ?? { position: "fixed", visibility: "hidden", width }}
    >
      {children}
    </div>,
    document.body,
  );
}

function TimePicker({
  value,
  onSelect,
  onClose,
  anchorRef,
  placement = "above",
}: TimePickerProps) {
  const [selectedHour, selectedMinute] = value.split(":");
  const hours = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, minute) => String(minute * 5).padStart(2, "0"));

  function selectHour(hour: string) {
    onSelect(`${hour}:${selectedMinute}`);
  }

  function selectMinute(minute: string) {
    onSelect(`${selectedHour}:${minute}`);
    onClose();
  }

  return (
    <FloatingPickerPanel
      anchorRef={anchorRef}
      className="grid w-36 grid-cols-2 gap-1 rounded-xl border border-stone-200 bg-[#fdfaf7] p-1.5 shadow-[0_12px_30px_rgba(78,58,44,0.18)] dark:border-stone-700 dark:bg-stone-900"
      picker="time"
      placement={placement}
      width={144}
    >
      <div className="time-picker-column max-h-36 overflow-y-auto pr-0.5">
        {hours.map((hour) => (
          <button className={hour === selectedHour ? "time-picker-option is-selected" : "time-picker-option"} key={hour} onClick={() => selectHour(hour)} type="button">
            {hour}
          </button>
        ))}
      </div>
      <div className="time-picker-column max-h-36 overflow-y-auto pl-0.5">
        {minutes.map((minute) => (
          <button className={minute === selectedMinute ? "time-picker-option is-selected" : "time-picker-option"} key={minute} onClick={() => selectMinute(minute)} type="button">
            {minute}
          </button>
        ))}
      </div>
    </FloatingPickerPanel>
  );
}

function CalendarPicker({
  selectedDate,
  onSelect,
  onClose,
  anchorRef,
  placement = "above",
}: CalendarPickerProps) {
  const [month, setMonth] = useState(() => fromDateKey(selectedDate));
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : new Date(year, monthIndex, index - firstDay + 1),
  );

  function moveMonth(offset: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <FloatingPickerPanel
      anchorRef={anchorRef}
      className="w-64 rounded-xl border border-stone-200 bg-[#fdfaf7] p-3 shadow-[0_12px_30px_rgba(78,58,44,0.18)] dark:border-stone-700 dark:bg-stone-900"
      picker="date"
      placement={placement}
      width={256}
    >
      <div className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-200">
        <button aria-label="上个月" className="grid size-7 place-items-center rounded-md hover:bg-stone-100 dark:hover:bg-stone-800" onClick={() => moveMonth(-1)} type="button">
          <ChevronLeft size={15} />
        </button>
        <span>{year}年{monthIndex + 1}月</span>
        <button aria-label="下个月" className="grid size-7 place-items-center rounded-md hover:bg-stone-100 dark:hover:bg-stone-800" onClick={() => moveMonth(1)} type="button">
          <ChevronRight size={15} />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center text-[10px] text-stone-400">
        {weekDays.map((weekDay) => <span key={weekDay}>{weekDay}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
        {days.map((date, index) => date ? (
          <button
            className={isSameDate(date, fromDateKey(selectedDate)) ? "mx-auto grid size-7 place-items-center rounded-full bg-[#b73a2f] text-xs text-white" : "mx-auto grid size-7 place-items-center rounded-full text-xs text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"}
            key={toDateKey(date)}
            onClick={() => {
              onSelect(toDateKey(date));
              onClose();
            }}
            type="button"
          >
            {date.getDate()}
          </button>
        ) : <span key={`empty-${index}`} />)}
      </div>
      <div className="mt-2 flex gap-1 border-t border-stone-100 pt-2 dark:border-stone-800">
        {[0, 1, 2].map((offset) => {
          const date = new Date();
          date.setDate(date.getDate() + offset);
          const label = offset === 0 ? "今天" : offset === 1 ? "明天" : "后天";
          return (
            <button className="flex-1 rounded-md py-1 text-[10px] text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100" key={label} onClick={() => { onSelect(toDateKey(date)); onClose(); }} type="button">
              {label}
            </button>
          );
        })}
      </div>
    </FloatingPickerPanel>
  );
}

export type TaskFormOptionsProps = {
  priority: TaskPriority;
  scheduledDate: string;
  shouldRemind: boolean;
  time: string;
  pickerPlacement?: PickerPlacement;
  onPriorityChange: (priority: TaskPriority) => void;
  onScheduledDateChange: (date: string) => void;
  onShouldRemindChange: (shouldRemind: boolean) => void;
  onTimeChange: (time: string) => void;
};

export function TaskFormOptions({
  priority,
  scheduledDate,
  shouldRemind,
  time,
  pickerPlacement = "above",
  onPriorityChange,
  onScheduledDateChange,
  onShouldRemindChange,
  onTimeChange,
}: TaskFormOptionsProps) {
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const timeButtonRef = useRef<HTMLButtonElement>(null);
  const selectedPriority = priorityOptions.find((option) => option.value === priority)!;

  useEffect(() => {
    if (openPicker !== "date" && openPicker !== "time") return;

    function closePickerWhenClickingOutside(event: PointerEvent) {
      const target = event.target as Element;
      const activeButton =
        openPicker === "date" ? dateButtonRef.current : timeButtonRef.current;

      if (activeButton?.contains(target)) return;
      if (target.closest(`[data-task-picker-type="${openPicker}"]`)) return;

      setOpenPicker(null);
    }

    document.addEventListener("pointerdown", closePickerWhenClickingOutside);
    return () =>
      document.removeEventListener(
        "pointerdown",
        closePickerWhenClickingOutside,
      );
  }, [openPicker]);

  return (
    <>
      <div className="relative mt-2 flex items-center gap-2 border-b border-stone-100 pb-2 dark:border-stone-800">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium leading-none text-stone-500 dark:text-stone-400"><Flag size={14} strokeWidth={1.6} />优先级</span>
        <button aria-expanded={openPicker === "priority"} className="ml-auto inline-flex items-center gap-1 p-0 !text-[11px] !font-medium !leading-none text-stone-500 outline-none dark:text-stone-400" onClick={() => setOpenPicker(openPicker === "priority" ? null : "priority")} type="button">{selectedPriority.label}<ChevronDown size={12} /></button>
        {openPicker === "priority" ? (
          <div className="absolute right-0 top-8 z-50 w-28 rounded-xl border border-stone-200 bg-white p-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
            {priorityOptions.map((option) => <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left !text-[11px] !font-medium !leading-none text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800" key={option.value} onClick={() => { onPriorityChange(option.value); setOpenPicker(null); }} type="button">{option.label}{priority === option.value ? <Check size={13} /> : null}</button>)}
          </div>
        ) : null}
      </div>

      <div className="relative flex items-center gap-2 border-b border-stone-100 py-2 dark:border-stone-800">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium leading-none text-stone-500 dark:text-stone-400"><CalendarDays size={14} strokeWidth={1.6} />时间</span>
        <div className="relative ml-auto">
          <button aria-expanded={openPicker === "date"} className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-[11px] leading-none text-stone-600 outline-none dark:bg-stone-800 dark:text-stone-300" onClick={() => setOpenPicker(openPicker === "date" ? null : "date")} ref={dateButtonRef} type="button">{formatScheduledDate(scheduledDate)}<ChevronDown size={12} /></button>
          {openPicker === "date" ? <CalendarPicker anchorRef={dateButtonRef} onClose={() => setOpenPicker(null)} onSelect={onScheduledDateChange} placement={pickerPlacement} selectedDate={scheduledDate} /> : null}
        </div>
        <button aria-expanded={openPicker === "time"} aria-label="任务时间" className="time-select" onClick={() => setOpenPicker(openPicker === "time" ? null : "time")} ref={timeButtonRef} type="button">
          <Clock3 size={11} />
          <span>{time.split(":")[0]}</span>
          <span className="text-stone-400">:</span>
          <span>{time.split(":")[1]}</span>
          <ChevronDown size={11} />
        </button>
        {openPicker === "time" ? <TimePicker anchorRef={timeButtonRef} onClose={() => setOpenPicker(null)} onSelect={onTimeChange} placement={pickerPlacement} value={time} /> : null}
      </div>

      <div className="relative flex items-center gap-2 border-b border-stone-100 py-2 dark:border-stone-800">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium leading-none text-stone-500 dark:text-stone-400"><Bell size={14} strokeWidth={1.6} />提醒</span>
        <button aria-expanded={openPicker === "reminder"} className="ml-auto inline-flex items-center gap-1 p-0 !text-[11px] !font-medium !leading-none text-stone-500 outline-none dark:text-stone-400" onClick={() => setOpenPicker(openPicker === "reminder" ? null : "reminder")} type="button">{shouldRemind ? "到时间提醒" : "不提醒"}<ChevronDown size={12} /></button>
        {openPicker === "reminder" ? (
          <div className="absolute right-0 top-9 z-50 w-28 rounded-xl border border-stone-200 bg-white p-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
            {[{ value: false, label: "不提醒" }, { value: true, label: "到时间提醒" }].map((option) => <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left !text-[11px] !font-medium !leading-none text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800" key={option.label} onClick={() => { onShouldRemindChange(option.value); setOpenPicker(null); }} type="button">{option.label}{shouldRemind === option.value ? <Check size={13} /> : null}</button>)}
          </div>
        ) : null}
      </div>
    </>
  );
}

export function AddTaskButton({ onAdd }: AddTaskButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const addDateButtonRef = useRef<HTMLButtonElement>(null);
  const addTimeButtonRef = useRef<HTMLButtonElement>(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [scheduledDate, setScheduledDate] = useState(() => toDateKey(new Date()));
  const [time, setTime] = useState("16:00");
  const [shouldRemind, setShouldRemind] = useState(false);
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setTitle("");
    setPriority("medium");
    setScheduledDate(toDateKey(new Date()));
    setTime("16:00");
    setShouldRemind(false);
    setOpenPicker(null);
    setError("");
    setIsAdding(false);
  }

  useEffect(() => {
    if (!isAdding) return;

    function closeWhenClickingOutside(event: PointerEvent) {
      if ((event.target as Element).closest("[data-task-picker-portal]")) {
        return;
      }

      if (formRef.current?.contains(event.target as Node)) return;

      setTitle("");
      setPriority("medium");
      setScheduledDate(toDateKey(new Date()));
      setTime("16:00");
      setShouldRemind(false);
      setOpenPicker(null);
      setError("");
      setIsAdding(false);
    }

    document.addEventListener("pointerdown", closeWhenClickingOutside);
    return () => document.removeEventListener("pointerdown", closeWhenClickingOutside);
  }, [isAdding]);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("请输入任务标题。");
      return;
    }

    setIsSubmitting(true);
    const wasSaved = await onAdd({
      title,
      priority,
      scheduledDate,
      scheduledTime: time,
      remindAt: shouldRemind ? reminderDateTime(scheduledDate, time) : null,
    });
    setIsSubmitting(false);

    if (wasSaved) resetForm();
  }

  const selectedPriority = priorityOptions.find((option) => option.value === priority)!;

  return (
    <div className="relative z-20 h-12">
      {!isAdding ? (
        <button
          className="flex h-12 w-full items-center gap-3 rounded-xl border border-stone-200 bg-white/45 px-4 text-left text-sm text-stone-500 shadow-[0_5px_14px_rgba(77,59,43,0.025)] transition-colors hover:border-stone-300 hover:bg-white dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-400 dark:hover:bg-stone-900"
          onClick={() => setIsAdding(true)}
          type="button"
        >
          <Plus className="shrink-0 text-[#b73a2f]" size={25} strokeWidth={1.5} />
          <span className="flex-1">添加今天的事情…</span>
          <kbd className="rounded-lg bg-stone-100 px-2 py-1 text-xs text-stone-400 dark:bg-stone-800">Enter</kbd>
        </button>
      ) : (
        <form className="add-task-form absolute bottom-0 left-0 z-30 w-full rounded-2xl border border-stone-200 bg-[#fdfaf7] p-3 shadow-[0_-12px_34px_rgba(78,58,44,0.18)] dark:border-stone-700 dark:bg-stone-900" onSubmit={handleSubmit} ref={formRef}>
          <div className="relative">
            <textarea aria-describedby={error ? "task-title-error" : undefined} autoFocus className="min-h-[60px] w-full resize-none rounded-lg border border-[#dd8f88] bg-white px-3 py-2.5 pr-9 text-xs text-stone-800 outline-none placeholder:text-stone-400 focus:border-[#b73a2f] dark:bg-stone-950 dark:text-stone-100" onChange={(event) => { setTitle(event.target.value); if (error) setError(""); }} placeholder="输入你要做的事情…" rows={2} value={title} />
            <button aria-label="清空任务标题" className="absolute right-1 top-1 grid size-8 place-items-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200" onClick={() => setTitle("")} type="button"><X size={14} strokeWidth={1.8} /></button>
          </div>
          {error ? <p className="mt-1 text-xs text-red-700 dark:text-red-300" id="task-title-error">{error}</p> : null}

          <div className="relative mt-2 flex items-center gap-2 border-b border-stone-100 pb-2 dark:border-stone-800">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium leading-none text-stone-500 dark:text-stone-400"><Flag size={14} strokeWidth={1.6} />优先级</span>
            <button aria-expanded={openPicker === "priority"} className="ml-auto inline-flex items-center gap-1 p-0 !text-[11px] !font-medium !leading-none text-stone-500 outline-none dark:text-stone-400" onClick={() => setOpenPicker(openPicker === "priority" ? null : "priority")} type="button">{selectedPriority.label}<ChevronDown size={12} /></button>
            {openPicker === "priority" ? (
              <div className="absolute right-0 top-8 z-50 w-28 rounded-xl border border-stone-200 bg-white p-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
                {priorityOptions.map((option) => <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left !text-[11px] !font-medium !leading-none text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800" key={option.value} onClick={() => { setPriority(option.value); setOpenPicker(null); }} type="button">{option.label}{priority === option.value ? <Check size={13} /> : null}</button>)}
              </div>
            ) : null}
          </div>

          <div className="relative flex items-center gap-2 border-b border-stone-100 py-2 dark:border-stone-800">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium leading-none text-stone-500 dark:text-stone-400"><CalendarDays size={14} strokeWidth={1.6} />时间</span>
            <div className="relative ml-auto">
              <button aria-expanded={openPicker === "date"} className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-[11px] leading-none text-stone-600 outline-none dark:bg-stone-800 dark:text-stone-300" onClick={() => setOpenPicker(openPicker === "date" ? null : "date")} ref={addDateButtonRef} type="button">{formatScheduledDate(scheduledDate)}<ChevronDown size={12} /></button>
              {openPicker === "date" ? <CalendarPicker anchorRef={addDateButtonRef} onClose={() => setOpenPicker(null)} onSelect={setScheduledDate} selectedDate={scheduledDate} /> : null}
            </div>
            <button aria-expanded={openPicker === "time"} aria-label="任务时间" className="time-select" onClick={() => setOpenPicker(openPicker === "time" ? null : "time")} ref={addTimeButtonRef} type="button">
              <Clock3 size={11} />
              <span>{time.split(":")[0]}</span>
              <span className="text-stone-400">:</span>
              <span>{time.split(":")[1]}</span>
              <ChevronDown size={11} />
            </button>
            {openPicker === "time" ? <TimePicker anchorRef={addTimeButtonRef} onClose={() => setOpenPicker(null)} onSelect={setTime} value={time} /> : null}
          </div>

          <div className="relative flex items-center gap-2 border-b border-stone-100 py-2 dark:border-stone-800">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium leading-none text-stone-500 dark:text-stone-400"><Bell size={14} strokeWidth={1.6} />提醒</span>
            <button aria-expanded={openPicker === "reminder"} className="ml-auto inline-flex items-center gap-1 p-0 !text-[11px] !font-medium !leading-none text-stone-500 outline-none dark:text-stone-400" onClick={() => setOpenPicker(openPicker === "reminder" ? null : "reminder")} type="button">{shouldRemind ? "到时间提醒" : "不提醒"}<ChevronDown size={12} /></button>
            {openPicker === "reminder" ? (
              <div className="absolute right-0 top-9 z-50 w-28 rounded-xl border border-stone-200 bg-white p-1 shadow-lg dark:border-stone-700 dark:bg-stone-900">
                {[{ value: false, label: "不提醒" }, { value: true, label: "到时间提醒" }].map((option) => <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left !text-[11px] !font-medium !leading-none text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800" key={option.label} onClick={() => { setShouldRemind(option.value); setOpenPicker(null); }} type="button">{option.label}{shouldRemind === option.value ? <Check size={13} /> : null}</button>)}
              </div>
            ) : null}
          </div>

          <label className="mt-2 flex items-center gap-2 rounded-lg bg-stone-100 px-2 py-1.5 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400"><FileText size={14} strokeWidth={1.6} /><input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-stone-400" placeholder="备注将在后续版本支持" readOnly /></label>

          <div className="mt-3 flex items-center justify-between">
            <button className="rounded-lg px-2 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" onClick={resetForm} type="button">取消</button>
            <button className="rounded-lg bg-stone-800 px-5 py-2 text-xs text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300" disabled={isSubmitting} type="submit">{isSubmitting ? "添加中…" : "添加任务"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
