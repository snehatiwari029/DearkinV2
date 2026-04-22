import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { LeavePlanPDF } from "@/lib/pdf/LeavePlanPDF";
import { CalculationResult } from "@/lib/pfml/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result: CalculationResult = body.result;
    const email: string | undefined = body.email;

    if (!result || !result.isEligible) {
      return NextResponse.json({ error: "Invalid result" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(LeavePlanPDF, { result, email }) as any
    );

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="dearkin-leave-plan.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
