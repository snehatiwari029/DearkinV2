"use client";

import { useState } from "react";
import CalculatorForm from "./CalculatorForm";
import BenefitResult from "./BenefitResult";
import WeeklyTimeline from "./WeeklyTimeline";
import { ClaimInput, CalculationResult } from "@/lib/pfml/types";
import { calculate } from "@/lib/pfml/wa-calculator";

export default function CalculatorShell() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleCalculate(input: ClaimInput) {
    setIsLoading(true);
    try {
      const calcResult = calculate(input);
      setResult(calcResult);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-parchment py-12">
      <div className="container-page max-w-5xl">
        <div className="mb-10">
          <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-2">
            Washington State
          </p>
          <h1 className="font-serif text-4xl text-ink mb-3">
            PFML Leave Calculator
          </h1>
          <p className="text-ink-mid text-lg max-w-2xl">
            See your week-by-week income during parental leave — including PFML benefits,
            employer top-up, and STD stacking. Free, instant, and specific to your situation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-card border border-cream-dark p-6 lg:p-8 h-fit">
            <h2 className="font-semibold text-ink mb-6">Your Details</h2>
            <CalculatorForm onCalculate={handleCalculate} isLoading={isLoading} />
          </div>

          <div>
            {result ? (
              <div className="space-y-6">
                <div className="bg-white rounded-card border border-cream-dark p-6 lg:p-8">
                  <h2 className="font-semibold text-ink mb-6">Your Results</h2>
                  <BenefitResult result={result} />
                </div>

                {result.isEligible && result.timeline.length > 0 && (
                  <div className="bg-white rounded-card border border-cream-dark p-6 lg:p-8">
                    <WeeklyTimeline
                      timeline={result.timeline}
                      fullSalaryWeekly={result.fullSalaryWeekly}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-cream rounded-card border border-cream-dark p-8 text-center h-full flex items-center justify-center min-h-[200px]">
                <div>
                  <p className="text-2xl mb-3">📊</p>
                  <p className="text-ink-mid font-medium">Fill in your details to see your personalised leave income breakdown.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-ink-light text-center mt-10">
          Not legal or financial advice. WA PFML estimates based on 2026 rate tables. Verify with your HR and the WA Employment Security Department.
        </p>
      </div>
    </div>
  );
}
