import { ClaimInput } from "./types";

export interface LeaveRules {
  totalWeeks: number;
  hasWaitingWeek: boolean;
  waitingWeekDays: number;
}

export function getLeaveRules(input: Pick<ClaimInput, "leaveType" | "hasComplications">): LeaveRules {
  const { leaveType, hasComplications } = input;

  if (leaveType === "bonding") {
    return { totalWeeks: 12, hasWaitingWeek: false, waitingWeekDays: 0 };
  }

  if (leaveType === "medical") {
    if (hasComplications) {
      return { totalWeeks: 14, hasWaitingWeek: false, waitingWeekDays: 0 };
    }
    return { totalWeeks: 12, hasWaitingWeek: false, waitingWeekDays: 0 };
  }

  if (leaveType === "combined") {
    if (hasComplications) {
      return { totalWeeks: 18, hasWaitingWeek: false, waitingWeekDays: 0 };
    }
    return { totalWeeks: 16, hasWaitingWeek: false, waitingWeekDays: 0 };
  }

  return { totalWeeks: 12, hasWaitingWeek: true, waitingWeekDays: 7 };
}

export function checkEligibility(hoursWorked: number): { eligible: boolean; reason?: string } {
  if (hoursWorked < 820) {
    return { eligible: false, reason: `Must work at least 820 hours. You reported ${hoursWorked} hours.` };
  }
  return { eligible: true };
}
