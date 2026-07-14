import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { useEffect, useState } from "react";

export function useAutostart() {
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setEnabled(await isEnabled());
      } catch {
        setError("无法读取开机启动状态。请稍后重试。");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function setAutostart(nextEnabled: boolean) {
    const previous = enabled;
    setEnabled(nextEnabled);
    setError(null);

    try {
      if (nextEnabled) {
        await enable();
      } else {
        await disable();
      }
      setEnabled(await isEnabled());
    } catch {
      setEnabled(previous);
      setError("无法更新开机启动设置，已恢复原状态。");
    }
  }

  return { enabled, error, isLoading, setAutostart };
}
