import { ClaimInput, CalculationResult, WeekEntry, PFMLRates } from "./types";
import { getRatesForClaimDate } from "./wa-rates";
import { getLeaveRules, checkEligibility } from "./wa-rules";
import { getEmployer } from "./employers";

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
    benefit = (halfSAWW * 0.9) + (aww - halfSAWW) * 0.5;
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

export function calculate(input: ClaimInput): CalculationResult {
  const { annualSalary, leaveStartDate, employer: employerKey, leaveType, hasComplications, hoursWorked } = input;

  const eligibility = checkEligibility(hoursWorked);
  if (!eligibility.eligible) {
    const employer = getEmployer(employerKey);
    return {
      isEligible: false,
      ineligibilityReason: eligibility.reason,
      weeklyBenefit: 0,
      fullSalaryWeekly: annualSalary / 52,
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
  const fullSalaryWeekly = annualSalary / 52;
  const leaveRules = getLeaveRules({ leaveType, hasComplications });
  const employer = getEmployer(employerKey);
  const { totalWeeks, hasWaitingWeek } = leaveRules;

  const timeline: WeekEntry[] = [];

  for (let week = 1; week <= totalWeeks; week++) {
    const isWaitingWeek = hasWaitingWeek && week === 1;
    const pfmlBenefit = isWaitingWeek ? 0 : weeklyBenefit;

    const isSTDActive = employer.stdWeeks > 0 && week <= employer.stdWeeks;
    let stdBenefit = 0;
    if (isSTDActive) {
      stdBenefit = Math.max(0, fullSalaryWeekly - pfmlBenefit);
      stdBenefit = Math.round(stdBenefit * 100) / 100;
    }

    const isEmployerTopUpActive = employer.topUpWeeks > 0 && week <= employer.topUpWeeks;
    let employerTopUp = 0;
    if (isEmployerTopUpActive && !isSTDActive) {
      const targetIncome = fullSalaryWeekly * (employer.topUpPercent / 100);
      employerTopUp = Math.max(0, targetIncome - pfmlBenefit);
      employerTopUp = Math.round(employerTopUp * 100) / 100;
    } else if (isEmployerTopUpActive && isSTDActive) {
      employerTopUp = 0;
    }

    const totalIncome = Math.round((pfmlBenefit + employerTopUp + stdBenefit) * 100) / 100;
    const gap = Math.max(0, Math.round((fullSalaryWeekly - totalIncome) * 100) / 100);

    timeline.push({
      week,
      pfmlBenefit,
      employerTopUp,
      stdBenefit,
      totalIncome,
      gap,
      isWaitingWeek,
      isEmployerTopUpActive,
      isSTDActive,
    });
  }

  const totalPFMLIncome = Math.round(timeline.reduce((s, w) => s + w.pfmlBenefit, 0) * 100) / 100;
  const totalEmployerTopUp = Math.round(timeline.reduce((s, w) => s + w.employerTopUp, 0) * 100) / 100;
  const totalSTDIncome = Math.round(timeline.reduce((s, w) => s + w.stdBenefit, 0) * 100) / 100;
  const totalIncome = Math.round(timeline.reduce((s, w) => s + w.totalIncome, 0) * 100) / 100;
  const totalIncomeGap = Math.round(timeline.reduce((s, w) => s + w.gap, 0) * 100) / 100;

  return {
    isEligible: true,
    weeklyBenefit,
    fullSalaryWeekly: Math.round(fullSalaryWeekly * 100) / 100,
    totalLeaveWeeks: totalWeeks,
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
