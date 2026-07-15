import { describe, expect, it } from "vitest";

import { formatChineseLunarDate } from "./TodayTasks";

describe("formatChineseLunarDate", () => {
  it("uses traditional Chinese wording for the lunar day", () => {
    expect(formatChineseLunarDate(new Date(2026, 6, 15))).toBe("农历六月初二");
  });
});
