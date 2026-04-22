"use client";

import { useState } from "react";
import { CalculationResult } from "@/lib/pfml/types";
import { trackEvent } from "@/lib/analytics";

interface EmailCaptureProps {
  result: CalculationResult;
}

type UIState = "idle" | "loading" | "success" | "error";
type PDFState = "idle" | "loading" | "error";

export default function EmailCapture({ result }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [captureState, setCaptureState] = useState<UIState>("idle");
  const [pdfState, setPdfState] = useState<PDFState>("idle");
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setCaptureState("loading");

    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          state: "WA",
          employer: result.employer.name,
          salaryBand: result.salaryBand,
          leaveType: null,
          weeklyBenefit: result.weeklyBenefit,
          hasGap: result.totalIncomeGap > 0,
        }),
      });

      if (!res.ok) throw new Error("Capture failed");
      setCapturedEmail(email.trim());
      setCaptureState("success");
      trackEvent("email_captured");
    } catch {
      setCaptureState("error");
    }
  }

  async function handleDownloadPDF() {
    setPdfState("loading");
    trackEvent("pdf_downloaded");

    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, email: capturedEmail ?? undefined }),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dearkin-leave-plan.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setPdfState("idle");
    } catch {
      setPdfState("error");
    }
  }

  return (
    <div className="bg-cream border border-cream-dark rounded-card p-6 space-y-4">
      <div>
        <p className="text-sm font-semibold text-ink mb-0.5">
          Save & Download Your Leave Plan
        </p>
        <p className="text-sm text-ink-mid">
          Get a PDF of your personalised week-by-week income breakdown.
        </p>
      </div>

      {captureState !== "success" ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-cream-dark rounded-input bg-white text-ink placeholder:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
          />
          <button
            type="submit"
            disabled={captureState === "loading"}
            className="px-5 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white text-sm font-semibold rounded-card transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {captureState === "loading" ? "Saving…" : "Get PDF"}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sage font-semibold text-sm">
              ✓ Email saved
            </span>
            <span className="text-ink-light text-sm">{capturedEmail}</span>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfState === "loading"}
            className="w-full py-3 bg-terracotta hover:bg-terracotta-dark text-white font-semibold text-sm rounded-card transition-colors disabled:opacity-50"
          >
            {pdfState === "loading" ? "Generating PDF…" : "⬇ Download Leave Plan PDF"}
          </button>
          {pdfState === "error" && (
            <p className="text-xs text-red-600">
              PDF generation failed. Please try again.
            </p>
          )}
        </div>
      )}

      {captureState === "error" && (
        <p className="text-xs text-red-600">
          Something went wrong. Please try again.
        </p>
      )}

      <p className="text-xs text-ink-light">
        No spam. We&apos;ll only send product updates relevant to your leave.
      </p>
    </div>
  );
}
