import { ClaimInput, CalculationResult, WeekEntry, PFMLRates } from "./types";
import { getRatesForClaimDate } from "./wa-rates";
import { getLeaveRules, checkEligibility } from "./wa-rules";
import { getEmployer } from "./employers";

/**
 * Calculate weekly PFML benefit amount based on AWW and rates.
 *
 * Formula (CLAUDE.md):
 *   AWW = annualSalary / 52
 *   If AWW <= SAWW/2: weeklyBenefit = AWW * 0.90
 *   If AWW > SAWW/2: weeklyBenefit = (SAWW/2 * 0.90) + (AWW - SAWW/2) * 0.50
 *   Clamp: MIN_BENEFIT to MAX_BENEFIT
 *   Exception: if AWW < MIN_BENEFIT, return AWW (full wage, not floor)
 */
export function calcWeeklyBenefit(annualSalary: number, rates: PFMLRates): number {
  const aww = annualSalary / 52;
  const halfSAWW = rates.SAWW / 2;

  // Exception: if AWW itself is below MIN_BENEFIT, return AWW (not the floor)
  if (aww < rates.MIN_BENEFIT) {
    return Math.round(aww * 100) / 100;
  }

  let benefit: number;
  if (aww <= halfSAWW) {
    benefit = aww * 0.9;
  } else {
    benefit = halfSAWW * 0.9 + (aww - halfSAWW) * 0.5;
  }

  benefit = Math.max(rates.MIN_BENEFIT, Math.min(rates.MAX_BENEFIT, benefit));
  return Math.round(benefit * 100) / 100;
}

export function getSalaryBand(annualSalary: number): string {
  if (annualSalary < 50000) return "<$50K";
  if (annualSalary < 75000) return "$50K-$75K";
  if (annualSalary < 100000) return "$75K-$100K";
  if (annualSalary < 125000) return "$100K-$125K";
  if (annualSalary < 150000) return "$125K-$150K";
  if (annualSalary < 200000) return "$150K-$200K";
  return "$200K+";
}

/**
 * Build a single week's income breakdown.
 *
 * Stacking rules:
 * 1. PFML pays weeklyBenefit for weeks 1..pfmlWeeks (0 during waiting week).
 * 2. STD is active for weeks 1..stdWeeks. It fills the gap between PFML and full salary,
 *    capped at full salary (AWW). STD replaces employer top-up during overlap weeks.
 * 3. Employer top-up is active for weeks 1..topUpWeeks. During STD weeks, employer top-up
 *    is $0 (STD handles the gap). After STD ends, top-up fills to topUpPercent of salary,
 *    but only if that target exceeds the PFML benefit — if PFML already exceeds the target
 *    (can happen at lower top-up %, e.g. Costco 60%) top-up stays $0.
 * 4. After PFML weeks end (weeks pfmlWeeks+1..topUpWeeks), PFML = $0 and employer
 *    top-up covers the full topUpPercent target. This handles Amazon weeks 17-20.
 * 5. Gap = max(0, fullSalaryWeekly - totalIncome).
 */
function buildWeek(
  week: number,
  pfmlWeeks: number,
  pfmlBenefitAmount: number,
  fullSalaryWeekly: number,
  hasWaitingWeek: boolean,
  stdWeeks: number,
  topUpWeeks: number,
  topUpPercent: number
): WeekEntry {
  const isWaitingWeek = hasWaitingWeek && week === 1;
  const inPFMLWindow = week <= pfmlWeeks;

  // PFML: active during PFML window, $0 during waiting week
  const pfmlBenefit = inPFMLWindow && !isWaitingWeek ? pfmlBenefitAmount : 0;

  // STD: active weeks 1..stdWeeks (only relevant during PFML window)
  const isSTDActive = stdWeeks > 0 && week <= stdWeeks && inPFMLWindow;
  let stdBenefit = 0;
  if (isSTDActive) {
    // STD fills gap between PFML and full salary, never exceeds AWW
    stdBenefit = Math.max(0, fullSalaryWeekly - pfmlBenefit);
    stdBenefit = Math.round(stdBenefit * 100) / 100;
  }

  // Employer top-up: active weeks 1..topUpWeeks
  const isEmployerTopUpActive = topUpWeeks > 0 && week <= topUpWeeks;
  let employerTopUp = 0;
  if (isEmployerTopUpActive && !isSTDActive) {
    // Target = topUpPercent% of full salary
    const targetIncome = fullSalaryWeekly * (topUpPercent / 100);
    // Top-up fills the gap between PFML and target (if PFML already meets/exceeds target, topUp=0)
    employerTopUp = Math.max(0, targetIncome - pfmlBenefit);
    employerTopUp = Math.round(employerTopUp * 100) / 100;
  }
  // During STD weeks: STD handles gap, employer top-up = 0 (already 0 by default)

  const totalIncome = Math.round((pfmlBenefit + employerTopUp + stdBenefit) * 100) / 100;
  const gap = Math.max(0, Math.round((fullSalaryWeekly - totalIncome) * 100) / 100);

  return {
    week,
    pfmlBenefit,
    employerTopUp,
    stdBenefit,
    totalIncome,
    gap,
    isWaitingWeek,
    isEmployerTopUpActive,
    isSTDActive,
  };
}

/**
 * Main calculation engine. Pure function — no side effects.
 *
 * Timeline length = max(pfmlWeeks, employer.topUpWeeks)
 * This correctly shows Amazon weeks 17-20 (employer paid, PFML exhausted).
 */
export function calculate(input: ClaimInput): CalculationResult {
  const {
    annualSalary,
    leaveStartDate,
    employer: employerKey,
    leaveType,
    hasComplications,
    hoursWorked,
  } = input;

  // Eligibility check first
  const eligibility = checkEligibility(hoursWorked);
  if (!eligibility.eligible) {
    const employer = getEmployer(employerKey);
    return {
      isEligible: false,
      ineligibilityReason: eligibility.reason,
      weeklyBenefit: 0,
      fullSalaryWeekly: Math.round((annualSalary / 52) * 100) / 100,
      totalLeaveWeeks: 0,
      hasWaitingWeek: false,
      employer,
      timeline: [],
      totalPFMLIncome: 0,
      totalEmployerTopUp: 0,
      totalSTDIncome: 0,
      totalIncome: 0,
      totalIncomeGap: 0,
      salaryBand: getSalaryBand(annualSalary),
    };
  }

  const rates = getRatesForClaimDate(leaveStartDate);
  const weeklyBenefit = calcWeeklyBenefit(annualSalary, rates);
  const fullSalaryWeekly = Math.round((annualSalary / 52) * 100) / 100;
  const leaveRules = getLeaveRules({ leaveType, hasComplications });
  const employer = getEmployer(employerKey);
  const { totalWeeks: pfmlWeeks, hasWaitingWeek } = leaveRules;

  // Timeline extends to whichever is longer: PFML leave or employer top-up coverage
  // e.g. Amazon 20 weeks top-up on 16-week combined leave → 20 weeks total
  const timelineWeeks = Math.max(pfmlWeeks, employer.topUpWeeks);

  const timeline: WeekEntry[] = [];
  for (let week = 1; week <= timelineWeeks; week++) {
    timeline.push(
      buildWeek(
        week,
        pfmlWeeks,
        weeklyBenefit,
        fullSalaryWeekly,
        hasWaitingWeek,
        employer.stdWeeks,
        employer.topUpWeeks,
        employer.topUpPercent
      )
    );
  }

  const totalPFMLIncome = Math.round(timeline.reduce((s, w) => s + w.pfmlBenefit, 0) * 100) / 100;
  const totalEmployerTopUp = Math.round(timeline.reduce((s, w) => s + w.employerTopUp, 0) * 100) / 100;
  const totalSTDIncome = Math.round(timeline.reduce((s, w) => s + w.stdBenefit, 0) * 100) / 100;
  const totalIncome = Math.round(timeline.reduce((s, w) => s + w.totalIncome, 0) * 100) / 100;
  const totalIncomeGap = Math.round(timeline.reduce((s, w) => s + w.gap, 0) * 100) / 100;

  return {
    isEligible: true,
    weeklyBenefit,
    fullSalaryWeekly,
    totalLeaveWeeks: timelineWeeks,
    hasWaitingWeek,
    employer,
    timeline,
    totalPFMLIncome,
    totalEmployerTopUp,
    totalSTDIncome,
    totalIncome,
    totalIncomeGap,
    salaryBand: getSalaryBand(annualSalary),
  };
}
