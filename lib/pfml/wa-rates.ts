import { PFMLRates } from "./types";

export const WA_RATES: Record<number, PFMLRates> = {
  2025: {
    year: 2025,
    SAWW: 1714,
    MAX_BENEFIT: 1542,
    MIN_BENEFIT: 100,
  },
  2026: {
    year: 2026,
    SAWW: 1830,
    MAX_BENEFIT: 1647,
    MIN_BENEFIT: 100,
  },
};

export const DEFAULT_RATES = WA_RATES[2026];

/**
 * Claim year = year of the Sunday immediately preceding the leave start date.
 */
export function getRatesForClaimDate(leaveStartDate: string): PFMLRates {
  const date = new Date(leaveStartDate);
  const dayOfWeek = date.getDay();
  const precedingSunday = new Date(date);
  precedingSunday.setDate(date.getDate() - dayOfWeek);
  const claimYear = precedingSunday.getFullYear();
  return WA_RATES[claimYear] ?? DEFAULT_RATES;
}
