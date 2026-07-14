import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Pin, Settings, X } from "lucide-react";

const appWindow = getCurrentWindow();

function runWindowAction(
  action: () => Promise<void>,
  onError: (message: string) => void,
) {
  void action().catch(() => {
    onError("窗口操作失败，请重新启动应用后重试。");
  });
}

function startWindowDrag(
  event: React.MouseEvent<HTMLElement>,
  onError: (message: string) => void,
) {
  if (event.button !== 0 || event.target instanceof Element && event.target.closest("button")) {
    return;
  }

  runWindowAction(() => appWindow.startDragging(), onError);
}

function toggleWindowLayer(
  isAlwaysOnTop: boolean,
  onChange: (isAlwaysOnTop: boolean) => void,
  onError: (message: string) => void,
) {
  const nextIsAlwaysOnTop = !isAlwaysOnTop;

  void (async () => {
    try {
      if (nextIsAlwaysOnTop) {
        await appWindow.setAlwaysOnBottom(false);
        await appWindow.setAlwaysOnTop(true);
      } else {
        await appWindow.setAlwaysOnTop(false);
        await appWindow.setAlwaysOnBottom(true);
      }
      onChange(nextIsAlwaysOnTop);
    } catch {
      try {
        await appWindow.setAlwaysOnTop(isAlwaysOnTop);
        await appWindow.setAlwaysOnBottom(!isAlwaysOnTop);
      } catch {
        // Keep the original error visible even if restoring the previous state fails.
      }

      onError("窗口层级切换失败，请重新启动应用后重试。");
    }
  })();
}

type WindowHeaderProps = {
  onOpenSettings: () => void;
};

export function WindowHeader({ onOpenSettings }: WindowHeaderProps) {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(true);
  const [windowError, setWindowError] = useState<string | null>(null);

  return (
    <header
      className="flex flex-wrap items-center gap-2 px-5 pb-2 pt-5"
      onMouseDown={(event) => startWindowDrag(event, setWindowError)}
    >
      <div className="min-w-0 flex-1 cursor-grab active:cursor-grabbing">
        <p className="app-logo text-[13px] font-semibold tracking-[0.26em] text-stone-600 dark:text-stone-300">
          NOT <span className="text-[#b73a2f]">TODAY</span>
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          aria-label={isAlwaysOnTop ? "置于底层" : "置于顶层"}
          className="grid size-8 place-items-center rounded-md text-stone-500 transition-colors hover:bg-stone-200 hover:text-[#b73a2f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:text-stone-400 dark:hover:bg-stone-800"
          onClick={() =>
            toggleWindowLayer(
              isAlwaysOnTop,
              setIsAlwaysOnTop,
              setWindowError,
            )
          }
          title={isAlwaysOnTop ? "置于底层" : "置于顶层"}
          type="button"
        >
          <Pin
            aria-hidden="true"
            fill={isAlwaysOnTop ? "currentColor" : "none"}
            size={16}
            strokeWidth={1.8}
          />
        </button>
        <button
          aria-label="打开设置"
          className="grid size-8 place-items-center rounded-md text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          onClick={onOpenSettings}
          title="设置"
          type="button"
        >
          <Settings aria-hidden="true" size={16} strokeWidth={1.8} />
        </button>
        <button
          aria-label="最小化窗口"
          className="grid size-8 place-items-center rounded-md text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          onClick={() =>
            runWindowAction(() => appWindow.minimize(), setWindowError)
          }
          title="最小化"
          type="button"
        >
          <Minus aria-hidden="true" size={17} strokeWidth={1.8} />
        </button>
        <button
          aria-label="关闭窗口"
          className="grid size-8 place-items-center rounded-md text-stone-500 transition-colors hover:bg-red-100 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:text-stone-400 dark:hover:bg-red-950 dark:hover:text-red-300"
          onClick={() =>
            runWindowAction(() => appWindow.close(), setWindowError)
          }
          title="关闭"
          type="button"
        >
          <X aria-hidden="true" size={17} strokeWidth={1.8} />
        </button>
      </div>
      {windowError ? (
        <p
          className="-mt-1 basis-full text-xs text-rose-600 dark:text-rose-400"
          role="alert"
        >
          {windowError}
        </p>
      ) : null}
    </header>
  );
}
