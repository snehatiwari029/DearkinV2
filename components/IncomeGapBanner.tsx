"use client";

import { useEffect } from "react";
import { CalculationResult } from "@/lib/pfml/types";
import { trackEvent } from "@/lib/analytics";

interface IncomeGapBannerProps {
  result: CalculationResult;
}

interface Suggestion {
  title: string;
  body: string;
  icon: string;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function getSuggestions(result: CalculationResult): Suggestion[] {
  const { totalIncomeGap, totalLeaveWeeks, employer } = result;
  const weeklyGap = result.timeline.find((w) => w.gap > 0)?.gap ?? 0;
  const suggestions: Suggestion[] = [];

  suggestions.push({
    icon: "🏦",
    title: "Emergency Fund",
    body: `Use your emergency fund to cover ${formatCurrency(totalIncomeGap)} over ${totalLeaveWeeks} weeks — that's ${formatCurrency(weeklyGap)}/week. Aim to have this saved before leave starts.`,
  });

  suggestions.push({
    icon: "👶",
    title: "Dependent Care FSA",
    body: "Max out your DCFSA ($5,000/year) before leave starts — it reduces childcare costs by roughly $1,500–$2,000 in tax savings once your child arrives.",
  });

  if (weeklyGap > 300) {
    suggestions.push({
      icon: "🏥",
      title: "HSA Pre-Funding",
      body: "If you're enrolled in an HDHP, max your HSA ($8,300 family, 2026) before leave. It grows tax-free and covers medical costs during and after pregnancy.",
    });
  }

  if (employer.topUpWeeks > 0 && employer.topUpPercent < 100) {
    const gapWeeks = result.timeline.filter((w) => w.gap > 0).length;
    suggestions.push({
      icon: "💬",
      title: "Negotiate Top-Up",
      body: `${employer.name}'s policy covers ${employer.topUpPercent}% of salary for ${employer.topUpWeeks} weeks. Ask HR whether a higher top-up rate is available — policies are sometimes negotiable at offer or return-to-work.`,
    });
  } else if (employer.topUpWeeks === 0) {
    suggestions.push({
      icon: "💬",
      title: "Negotiate Employer Top-Up",
      body: "Your employer has no listed top-up policy. Raising this during a promotion, new-offer, or return-to-work negotiation can meaningfully close this gap.",
    });
  }

  return suggestions.slice(0, 3);
}

export default function IncomeGapBanner({ result }: IncomeGapBannerProps) {
  useEffect(() => {
    trackEvent("gap_viewed");
  }, []);

  const suggestions = getSuggestions(result);
  const gapWeeks = result.timeline.filter((w) => w.gap > 0).length;

  return (
    <div className="space-y-4">
      <div className="bg-terracotta-light border border-terracotta/30 rounded-card p-5">
        <p className="text-sm font-semibold text-terracotta-dark mb-1">
          Income Gap Detected
        </p>
        <p className="font-serif text-2xl text-terracotta mb-1">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(result.totalIncomeGap)}{" "}
          total gap
        </p>
        <p className="text-sm text-ink-mid">
          {gapWeeks} {gapWeeks === 1 ? "week" : "weeks"} below full salary
          during your leave
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-ink-mid uppercase tracking-wider mb-3">
          3 Ways to Close Your Gap
        </p>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 bg-parchment border border-cream-dark rounded-card"
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold text-ink mb-0.5">{s.title}</p>
                <p className="text-sm text-ink-mid leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink-light">
        Not legal or financial advice. Consult a financial planner for your
        specific situation.
      </p>
    </div>
  );
}
