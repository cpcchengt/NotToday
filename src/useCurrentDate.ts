import { useEffect, useState } from "react";

function millisecondsUntilNextLocalDay(now = new Date()) {
  const nextDay = new Date(now);
  nextDay.setHours(24, 0, 1, 0);

  return Math.max(1_000, nextDay.getTime() - now.getTime());
}

export function useCurrentDate() {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    let timeoutId: number | undefined;

    function refreshDate() {
      setCurrentDate(new Date());
      timeoutId = window.setTimeout(refreshDate, millisecondsUntilNextLocalDay());
    }

    function refreshWhenAppReturns() {
      setCurrentDate(new Date());
    }

    timeoutId = window.setTimeout(refreshDate, millisecondsUntilNextLocalDay());
    window.addEventListener("focus", refreshWhenAppReturns);
    document.addEventListener("visibilitychange", refreshWhenAppReturns);

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      window.removeEventListener("focus", refreshWhenAppReturns);
      document.removeEventListener("visibilitychange", refreshWhenAppReturns);
    };
  }, []);

  return currentDate;
}
