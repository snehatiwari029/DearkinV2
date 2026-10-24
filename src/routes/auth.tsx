import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/dearkin/blocks";

const safePath = (p: unknown) => (typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? p : undefined);

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => { const r = safePath(s["redirect"]); return r ? { redirect: r } : {}; },
  head: () => ({
    meta: [
      { title: "Sign in — Dearkin" },
      { name: "description", content: "Sign in to your Dearkin village." },
      { property: "og:title", content: "Sign in — Dearkin" },
      { property: "og:description", content: "Build your village. Share care, not whereabouts." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      if (redirect) window.location.assign(redirect);
      else navigate({ to: "/today" });
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { first_name: name.trim() }, emailRedirectTo: window.location.origin + (redirect ?? "/") },
      });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary font-serif text-2xl text-primary-foreground">d</div>
          <h1 className="font-serif text-4xl text-foreground">Dearkin</h1>
          <p className="mt-1 font-serif text-lg italic text-primary">Build your village.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          {sent ? (
            <div className="text-center">
              <h2 className="font-serif text-2xl">Check your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">We sent a confirmation link to {email}. Open it to finish creating your account.</p>
              <Button variant="ghost" className="mt-4" onClick={() => { setSent(false); setMode("in"); }}>Back to sign in</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid grid-cols-2 rounded-2xl bg-muted p-1 text-sm font-medium">
                {(["in", "up"] as const).map((m) => (
                  <button type="button" key={m} onClick={() => setMode(m)}
                    className={`rounded-xl py-2 ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                    {m === "in" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
              {mode === "up" && <Field label="First name"><Input required value={name} onChange={(e) => setName(e.target.value)} /></Field>}
              <Field label="Email"><Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              <Field label="Password"><Input type="password" required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
              <Button size="lg" className="h-12 rounded-2xl" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
            </form>
          )}
        </div>

        <div className="mt-6 flex gap-3 rounded-3xl bg-forest p-5 text-forest-foreground">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <div className="font-semibold">Share care, not whereabouts.</div>
            <p className="mt-1 opacity-80">Only the day and care hours are shared. No location, notes, photos or ads — ever.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
