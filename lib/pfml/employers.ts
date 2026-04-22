import { EmployerPolicy } from "./types";

export const EMPLOYERS: Record<string, EmployerPolicy> = {
  amazon:    { name: "Amazon",       topUpWeeks: 20, topUpPercent: 100, stdWeeks: 6 },
  microsoft: { name: "Microsoft",    topUpWeeks: 20, topUpPercent: 100, stdWeeks: 6 },
  boeing:    { name: "Boeing",       topUpWeeks: 8,  topUpPercent: 100, stdWeeks: 6 },
  starbucks: { name: "Starbucks",    topUpWeeks: 18, topUpPercent: 100, stdWeeks: 6 },
  meta:      { name: "Meta",         topUpWeeks: 20, topUpPercent: 100, stdWeeks: 8 },
  google:    { name: "Google",       topUpWeeks: 18, topUpPercent: 100, stdWeeks: 6 },
  costco:    { name: "Costco",       topUpWeeks: 8,  topUpPercent: 60,  stdWeeks: 6 },
  expedia:   { name: "Expedia",      topUpWeeks: 20, topUpPercent: 100, stdWeeks: 6 },
  zillow:    { name: "Zillow",       topUpWeeks: 16, topUpPercent: 100, stdWeeks: 6 },
  nordstrom: { name: "Nordstrom",    topUpWeeks: 8,  topUpPercent: 100, stdWeeks: 6 },
  tmobile:   { name: "T-Mobile",     topUpWeeks: 12, topUpPercent: 100, stdWeeks: 6 },
  none:      { name: "Other / None", topUpWeeks: 0,  topUpPercent: 0,   stdWeeks: 0 },
};

export const EMPLOYER_OPTIONS = Object.entries(EMPLOYERS).map(([key, policy]) => ({
  key,
  label: policy.name,
}));

export function getEmployer(key: string): EmployerPolicy {
  return EMPLOYERS[key] ?? EMPLOYERS.none;
}
