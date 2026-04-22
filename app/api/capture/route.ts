import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, state, employer, salaryBand, leaveType, weeklyBenefit, hasGap } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Supabase insert — only runs when env vars are configured
    const supabase = getServiceClient();
    if (supabase) {
      const { error } = await supabase.from("email_captures").insert({
        email: email.toLowerCase().trim(),
        state: state ?? "WA",
        employer: employer ?? null,
        salary_band: salaryBand ?? null,
        leave_type: leaveType ?? null,
        weekly_benefit: weeklyBenefit ?? null,
        has_gap: hasGap ?? null,
      });

      if (error) {
        console.error("Supabase capture error:", error);
        // Don't fail the request — log and continue
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
