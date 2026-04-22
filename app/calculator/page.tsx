import type { Metadata } from "next";
import CalculatorShell from "./components/CalculatorShell";

export const metadata: Metadata = {
  title: "WA PFML Leave Calculator 2026 | Dearkin",
  description:
    "Calculate your Washington State Paid Family and Medical Leave (PFML) benefits week by week. Includes employer top-up, STD stacking, and income gap analysis for Amazon, Microsoft, Boeing, Google, Meta, and more.",
  keywords: [
    "WA PFML calculator",
    "Washington State paid family leave",
    "parental leave calculator Washington",
    "PFML 2026",
    "employer top-up leave",
    "maternity leave income calculator",
    "Amazon parental leave",
    "Microsoft parental leave",
  ],
  openGraph: {
    title: "WA PFML Leave Calculator 2026 | Dearkin",
    description:
      "See your week-by-week income during parental leave in Washington State. Free calculator with employer top-up and STD stacking.",
    url: "https://dearkin.com/calculator",
    siteName: "Dearkin",
    type: "website",
  },
  alternates: {
    canonical: "https://dearkin.com/calculator",
  },
};

export default function CalculatorPage() {
  return <CalculatorShell />;
}
