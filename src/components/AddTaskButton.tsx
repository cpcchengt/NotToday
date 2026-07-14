import { useState } from "react";
import { Plus } from "lucide-react";

import type { TaskPriority } from "../tasks/task";

type AddTaskButtonProps = {
  onAdd: (input: {
    title: string;
    priority: TaskPriority;
    remindAt: string | null;
  }) => Promise<boolean>;
};

export function AddTaskButton({ onAdd }: AddTaskButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [remindAt, setRemindAt] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setTitle("");
    setPriority("medium");
    setRemindAt("");
    setError("");
    setIsAdding(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("请输入任务标题。");
      return;
    }

    setIsSubmitting(true);
    const wasSaved = await onAdd({ title, priority, remindAt: remindAt || null });
    setIsSubmitting(false);

    if (wasSaved) resetForm();
  }

  if (!isAdding) {
    return (
      <button
        className="flex h-12 w-full items-center gap-3 rounded-xl border border-stone-200 bg-white/45 px-4 text-left text-sm text-stone-500 shadow-[0_5px_14px_rgba(77,59,43,0.025)] transition-colors hover:border-stone-300 hover:bg-white dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-400 dark:hover:bg-stone-900"
        onClick={() => setIsAdding(true)}
        type="button"
      >
        <Plus className="shrink-0 text-[#b73a2f]" size={25} strokeWidth={1.5} />
        <span className="flex-1">添加今天的事情…</span>
        <kbd className="rounded-lg bg-stone-100 px-2 py-1 text-xs text-stone-400 dark:bg-stone-800">Enter</kbd>
      </button>
    );
  }

  return (
    <form className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900" onSubmit={handleSubmit}>
      <input
        aria-describedby={error ? "task-title-error" : undefined}
        autoFocus
        className="w-full border-b border-stone-200 bg-transparent px-1 pb-2 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-[#b73a2f] dark:border-stone-700 dark:text-stone-100"
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) setError("");
        }}
        placeholder="添加今天的事情…"
        value={title}
      />
      {error ? <p className="mt-2 text-xs text-red-700 dark:text-red-300" id="task-title-error">{error}</p> : null}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <select className="rounded-lg bg-stone-100 px-2 py-1.5 text-xs text-stone-600 outline-none dark:bg-stone-800 dark:text-stone-300" onChange={(event) => setPriority(event.target.value as TaskPriority)} value={priority}>
          <option value="low">低优先级</option>
          <option value="medium">中优先级</option>
          <option value="high">高优先级</option>
        </select>
        <input className="rounded-lg bg-stone-100 px-2 py-1.5 text-xs text-stone-600 outline-none dark:bg-stone-800 dark:text-stone-300" onChange={(event) => setRemindAt(event.target.value)} type="datetime-local" value={remindAt} />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button className="rounded-lg px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" onClick={resetForm} type="button">取消</button>
        <button className="rounded-lg bg-[#b73a2f] px-3 py-1.5 text-xs text-white hover:bg-[#963027]" disabled={isSubmitting} type="submit">{isSubmitting ? "保存中…" : "添加任务"}</button>
      </div>
    </form>
  );
}
