import { useState } from "react";
import { Clock3, Coffee, Moon } from "lucide-react";

import { AddTaskButton } from "./components/AddTaskButton";
import { SettingsPanel } from "./components/SettingsPanel";
import { TodayTasks } from "./components/TodayTasks";
import { WindowHeader } from "./components/WindowHeader";
import { useTaskManager } from "./tasks/useTaskManager";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    addTask,
    error,
    isLoading,
    removeTask,
    tasks,
    toggleTask,
    updateTaskPriority,
    updateTaskReminder,
    updateTaskScheduledDate,
    updateTaskTitle,
  } = useTaskManager();

  return (
    <main className="h-screen overflow-hidden bg-[#fbf8f4] text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#fbf8f4] dark:bg-stone-900">
        <WindowHeader onOpenSettings={() => setIsSettingsOpen(true)} />
        {isSettingsOpen ? (
          <SettingsPanel onBack={() => setIsSettingsOpen(false)} />
        ) : (
          <>
            <TodayTasks
              error={error}
              isLoading={isLoading}
              onRemove={removeTask}
              onToggle={toggleTask}
              onUpdatePriority={updateTaskPriority}
              onUpdateReminder={updateTaskReminder}
              onUpdateScheduledDate={updateTaskScheduledDate}
              onUpdateTitle={updateTaskTitle}
              tasks={tasks}
            />
            <div className="px-5 pb-4 pt-3">
              <AddTaskButton onAdd={addTask} />
            </div>
            <footer className="flex items-center justify-between border-t border-stone-200/80 px-5 py-3 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <Clock3 size={17} strokeWidth={1.7} />
                <span>专注时长</span>
                <strong className="font-medium text-[#8b5e52] dark:text-stone-300">
                  2h 17m
                </strong>
              </div>
              <div className="flex items-center gap-4">
                <Coffee size={20} strokeWidth={1.6} />
                <span className="relative">
                  <Moon size={21} strokeWidth={1.6} />
                  <span className="absolute -right-1 -top-0.5 size-1.5 rounded-full bg-[#b73a2f]" />
                </span>
              </div>
            </footer>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
