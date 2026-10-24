import { describe, expect, it } from "vitest";
import { coverageSummary, isGap, type Block } from "@/lib/dearkin";

const b = (date: string, coverage_status: Block["coverage_status"]): Block => ({
  id: date + coverage_status, village_id: "v", child_alias: "Baby", date, start_time: "09:00", end_time: "13:00",
  assigned_user_id: null, coverage_status, created_by: "u", created_at: "",
});

describe("coverage rules", () => {
  it("seeded week reads as the spec says", () => {
    const sat = [b("2026-10-03", "confirmed"), b("2026-10-03", "confirmed")];
    const week = [...sat, b("2026-10-04", "pending"), b("2026-10-08", "needs_coverage")];
    expect(coverageSummary(sat, week, "2026-10-03")).toBe("Saturday is covered. One gap needs attention this week.");
  });
  it("a flagged conflict counts as a gap", () => {
    expect(isGap("conflict_flagged")).toBe(true);
    expect(isGap("pending")).toBe(false);
  });
});

import { fmtRange, isOvernight } from "@/lib/dearkin";
describe("overnight care", () => {
  it("9 PM to 6 AM is an overnight block ending next day", () => {
    const blk = { start_time: "21:00:00", end_time: "06:00:00" };
    expect(isOvernight(blk)).toBe(true);
    expect(fmtRange(blk)).toBe("9 PM – 6 AM (next day)");
  });
});
