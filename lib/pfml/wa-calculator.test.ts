import { describe, it, expect } from "vitest";
import { calcWeeklyBenefit, calculate } from "./wa-calculator";
import { WA_RATES } from "./wa-rates";

const RATES_2026 = WA_RATES[2026];
const RATES_2025 = WA_RATES[2025];

function makeInput(overrides: Partial<Parameters<typeof calculate>[0]> = {}) {
  return {
    annualSalary: 120000,
    leaveStartDate: "2026-06-15",
    employer: "none",
    leaveType: "combined" as const,
    hasComplications: false,
    hoursWorked: 1000,
    ...overrides,
  };
}

describe("WA PFML Calculator — 15 Unit Tests", () => {
  it("T01: $60K salary → $942.93 weekly benefit", () => {
    const benefit = calcWeeklyBenefit(60000, RATES_2026);
    expect(benefit).toBeCloseTo(942.93, 1);
  });

  it("T02: $47,580 threshold salary → $823.50", () => {
    const benefit = calcWeeklyBenefit(47580, RATES_2026);
    expect(benefit).toBeCloseTo(823.50, 1);
  });

  it("T03: $120K salary → $1,519.85 weekly benefit", () => {
    const benefit = calcWeeklyBenefit(120000, RATES_2026);
    expect(benefit).toBeCloseTo(1519.85, 1);
  });

  it("T04: $180K salary → $1,647.00 (capped at MAX)", () => {
    const benefit = calcWeeklyBenefit(180000, RATES_2026);
    expect(benefit).toBe(1647.00);
  });

  it("T05: $250K salary → $1,647.00 (capped at MAX)", () => {
    const benefit = calcWeeklyBenefit(250000, RATES_2026);
    expect(benefit).toBe(1647.00);
  });

  it("T06: $4K sub-floor salary → $76.92 (returns AWW, not MIN_BENEFIT)", () => {
    const benefit = calcWeeklyBenefit(4000, RATES_2026);
    expect(benefit).toBeCloseTo(76.92, 1);
  });

  it("T07: $6K salary → $103.85 weekly benefit", () => {
    const benefit = calcWeeklyBenefit(6000, RATES_2026);
    expect(benefit).toBeCloseTo(103.85, 1);
  });

  it("T08: $120K with 2025 rates → $1,496.65", () => {
    const benefit = calcWeeklyBenefit(120000, RATES_2025);
    expect(benefit).toBeCloseTo(1496.65, 1);
  });

  it("T09: Combined leave, no complications → 16 weeks", () => {
    const result = calculate(makeInput({ leaveType: "combined", hasComplications: false }));
    expect(result.totalLeaveWeeks).toBe(16);
  });

  it("T10: Combined leave, with complications → 18 weeks", () => {
    const result = calculate(makeInput({ leaveType: "combined", hasComplications: true }));
    expect(result.totalLeaveWeeks).toBe(18);
  });

  it("T11: Bonding only → 12 weeks, no waiting week", () => {
    const result = calculate(makeInput({ leaveType: "bonding", hasComplications: false }));
    expect(result.totalLeaveWeeks).toBe(12);
    expect(result.hasWaitingWeek).toBe(false);
  });

  it("T12: Amazon $120K → no income gap weeks 1-20", () => {
    const result = calculate(makeInput({ annualSalary: 120000, employer: "amazon", leaveType: "combined", hasComplications: false }));
    const first20Weeks = result.timeline.slice(0, 20);
    const gapSum = first20Weeks.reduce((s, w) => s + w.gap, 0);
    expect(gapSum).toBe(0);
  });

  it("T13: No top-up $120K → weekly gap ~$787.84 during PFML weeks", () => {
    const result = calculate(makeInput({ annualSalary: 120000, employer: "none", leaveType: "combined" }));
    const week1 = result.timeline[0];
    const expectedGap = result.fullSalaryWeekly - result.weeklyBenefit;
    expect(week1.gap).toBeCloseTo(expectedGap, 1);
    expect(week1.gap).toBeCloseTo(787.84, 1);
  });

  it("T14: STD stacking $120K (Amazon) → weeks 1-6 gap = $0", () => {
    const result = calculate(makeInput({ annualSalary: 120000, employer: "amazon" }));
    const std6Weeks = result.timeline.slice(0, 6);
    const gapSum = std6Weeks.reduce((s, w) => s + w.gap, 0);
    expect(gapSum).toBe(0);
  });

  it("T15: 819 hours → ineligible; 820 hours → eligible", () => {
    const ineligible = calculate(makeInput({ hoursWorked: 819 }));
    const eligible = calculate(makeInput({ hoursWorked: 820 }));
    expect(ineligible.isEligible).toBe(false);
    expect(eligible.isEligible).toBe(true);
  });
});
