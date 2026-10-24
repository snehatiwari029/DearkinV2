import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/dearkin/AppShell";
import { Field, NativeSelect } from "@/components/dearkin/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMe } from "@/lib/dearkin";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Create your village — Dearkin" }, { name: "description", content: "Set up your private village." }] }),
  component: Onboarding,
});

const PATTERNS = [
  { id: "parent_nanny", title: "Parent + Nanny Weekdays", desc: "Mon–Fri, 8 AM – 5 PM. Assign your nanny once they join." },
  { id: "grandparent_fridays", title: "Grandparent Fridays", desc: "Fridays, 9 AM – 5 PM." },
  { id: "blank", title: "Blank week", desc: "Start empty and add care yourself." },
];

function Onboarding() {
  const me = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Our Village");
  const [alias, setAlias] = useState("");
  const [bracket, setBracket] = useState("3-12mo");
  const [tz, setTz] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles");
  const [pattern, setPattern] = useState("parent_nanny");
  const [busy, setBusy] = useState(false);
  const firstName = (me.data?.user.user_metadata?.["first_name"] as string | undefined) ?? "";
  const [displayName, setDisplayName] = useState("");

  async function create() {
    setBusy(true);
    const { data, error } = await supabase.rpc("create_village", {
      _name: name, _alias: alias, _bracket: bracket as "3-12mo", _tz: tz, _display_name: displayName || firstName || "Parent", _pattern: pattern,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    localStorage.setItem("dearkin.village", data);
    await qc.invalidateQueries();
    toast.success("Your village is ready. Invite your people next.");
    navigate({ to: "/village" });
  }

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-md">
        <Brand />
        <h1 className="mt-10 font-serif text-4xl">Build your village</h1>
        <p className="mt-2 text-muted-foreground">Step {step} of 2 · Share care, not whereabouts.</p>
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
          {step === 1 ? (
            <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <Field label="Your name"><Input required placeholder={firstName} value={displayName || firstName} onChange={(e) => setDisplayName(e.target.value)} /></Field>
              <Field label="Village name"><Input required value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Child's first name or nickname"><Input required maxLength={30} placeholder="e.g. Baby" value={alias} onChange={(e) => setAlias(e.target.value)} /></Field>
              <p className="-mt-2 text-xs text-muted-foreground">Nickname only — we never ask for a full name.</p>
              <Field label="Age">
                <NativeSelect value={bracket} onChange={setBracket}>
                  <option value="0-3mo">0–3 months</option><option value="3-12mo">3–12 months</option>
                  <option value="1-2y">1–2 years</option><option value="2-5y">2–5 years</option>
                </NativeSelect>
              </Field>
              <Field label="Timezone"><Input required value={tz} onChange={(e) => setTz(e.target.value)} /></Field>
              <Button className="h-12 rounded-2xl">Continue</Button>
            </form>
          ) : (
            <div className="grid gap-3">
              <h2 className="font-serif text-xl">Pick a starter pattern</h2>
              <p className="-mt-2 text-sm text-muted-foreground">We'll create the next 2 weeks. You can edit any day.</p>
              {PATTERNS.map((p) => (
                <button key={p.id} onClick={() => setPattern(p.id)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${pattern === p.id ? "border-primary bg-sage/50" : "border-border hover:bg-accent/50"}`}>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-muted-foreground">{p.desc}</div>
                </button>
              ))}
              <div className="mt-2 flex gap-2">
                <Button variant="outline" className="h-12 rounded-2xl" onClick={() => setStep(1)}>Back</Button>
                <Button className="h-12 flex-1 rounded-2xl" disabled={busy} onClick={create}>Create village</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
