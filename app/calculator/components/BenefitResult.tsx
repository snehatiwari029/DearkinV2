import { CalculationResult } from "@/lib/pfml/types";

interface BenefitResultProps {
  result: CalculationResult;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function BenefitResult({ result }: BenefitResultProps) {
  if (!result.isEligible) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-card p-6">
        <p className="text-sm font-semibold text-red-700 mb-1">Not Eligible for WA PFML</p>
        <p className="text-sm text-red-600">{result.ineligibilityReason}</p>
      </div>
    );
  }

  const hasGap = result.totalIncomeGap > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-parchment border border-cream-dark rounded-card p-5">
          <p className="text-xs font-semibold text-ink-mid uppercase tracking-wider mb-1">Weekly PFML Benefit</p>
          <p className="font-serif text-3xl text-terracotta">{formatCurrency(result.weeklyBenefit)}</p>
        </div>
        <div className="bg-parchment border border-cream-dark rounded-card p-5">
          <p className="text-xs font-semibold text-ink-mid uppercase tracking-wider mb-1">Total Leave Duration</p>
          <p className="font-serif text-3xl text-ink">{result.totalLeaveWeeks} <span className="text-xl text-ink-mid">weeks</span></p>
        </div>
      </div>

      <div className="bg-parchment border border-cream-dark rounded-card p-5">
        <p className="text-xs font-semibold text-ink-mid uppercase tracking-wider mb-3">Weekly Income Comparison</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-ink-mid">Full salary (weekly)</span>
            <span className="text-sm font-semibold text-ink">{formatCurrency(result.fullSalaryWeekly)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-ink-mid">PFML benefit</span>
            <span className="text-sm font-semibold text-terracotta">{formatCurrency(result.weeklyBenefit)}</span>
          </div>
          {result.employer.topUpWeeks > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-ink-mid">
                {result.employer.name} top-up ({result.employer.topUpWeeks} wks)
              </span>
              <span className="text-sm font-semibold text-sage">Included</span>
            </div>
          )}
        </div>
      </div>

      {!hasGap && (
        <div className="bg-sage-light border border-sage/20 rounded-card p-5">
          <p className="text-sage font-semibold">✓ No income gap</p>
          <p className="text-sm text-sage-dark mt-1">
            Your employer top-up covers your full salary for your entire leave.
          </p>
        </div>
      )}

      {result.employer.topUpWeeks > 0 && (
        <div className="bg-cream border border-cream-dark rounded-card p-5">
          <p className="text-xs font-semibold text-ink-mid uppercase tracking-wider mb-3">
            {result.employer.name} Leave Policy
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-mid">Top-up weeks</span>
              <span className="font-medium text-ink">{result.employer.topUpWeeks} weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-mid">Top-up percentage</span>
              <span className="font-medium text-ink">{result.employer.topUpPercent}% of salary</span>
            </div>
            {result.employer.stdWeeks > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-mid">STD weeks</span>
                <span className="font-medium text-ink">{result.employer.stdWeeks} weeks</span>
              </div>
            )}
          </div>
          <p className="text-xs text-ink-light mt-3">
            Policies change — verify with HR
          </p>
        </div>
      )}

      <p className="text-xs text-ink-light text-center">
        Not legal or financial advice. Results are estimates based on 2026 WA PFML rates.
      </p>
    </div>
  );
}
