import { useAutostart } from "../settings/useAutostart";

type SettingsPanelProps = {
  onBack: () => void;
};

export function SettingsPanel({ onBack }: SettingsPanelProps) {
  const { enabled, error, isLoading, setAutostart } = useAutostart();

  return (
    <section className="flex flex-1 flex-col px-4 py-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.16em] text-stone-500 uppercase dark:text-stone-400">
            Preferences
          </p>
          <h1 className="mt-1 text-2xl tracking-tight">设置</h1>
        </div>
        <button
          className="rounded-md px-2 py-1 text-sm text-stone-600 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
          onClick={onBack}
          type="button"
        >
          返回
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm">开机启动</p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              登录 Windows 后自动打开 NotToday。
            </p>
          </div>
          <input
            aria-label="开机启动"
            checked={enabled}
            className="size-4 accent-stone-900 dark:accent-stone-100"
            disabled={isLoading}
            onChange={(event) => void setAutostart(event.target.checked)}
            type="checkbox"
          />
        </div>
        {error ? (
          <p
            className="mt-3 text-xs text-red-700 dark:text-red-300"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
