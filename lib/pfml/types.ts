export interface ClaimInput {
  annualSalary: number;
  leaveStartDate: string;
  employer: string;
  leaveType: "medical" | "bonding" | "combined";
  hasComplications: boolean;
  hoursWorked: number;
}

export interface PFMLRates {
  year: number;
  SAWW: number;
  MAX_BENEFIT: number;
  MIN_BENEFIT: number;
}

export interface WeekEntry {
  week: number;
  pfmlBenefit: number;
  employerTopUp: number;
  stdBenefit: number;
  totalIncome: number;
  gap: number;
  isWaitingWeek: boolean;
  isEmployerTopUpActive: boolean;
  isSTDActive: boolean;
}

export interface EmployerPolicy {
  name: string;
  topUpWeeks: number;
  topUpPercent: number;
  stdWeeks: number;
}

export interface CalculationResult {
  isEligible: boolean;
  ineligibilityReason?: string;
  weeklyBenefit: number;
  fullSalaryWeekly: number;
  totalLeaveWeeks: number;
  hasWaitingWeek: boolean;
  employer: EmployerPolicy;
  timeline: WeekEntry[];
  totalPFMLIncome: number;
  totalEmployerTopUp: number;
  totalSTDIncome: number;
  totalIncome: number;
  totalIncomeGap: number;
  salaryBand: string;
}
