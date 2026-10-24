import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/dearkin/blocks";
import { oauthCallbackUrl, rememberOAuthRedirect, safePath } from "@/lib/oauth";


type OAuthProvider = "google" | "apple" | "facebook";

const PROVIDERS: { id: OAuthProvider; label: string; icon: React.ReactNode }[] = [
  {
    id: "google",
    label: "Continue with Google",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.65Z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.28a12 12 0 0 0 0 10.8l4.01-3.1Z" />
        <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 1.28 6.6l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75Z" />
      </svg>
    ),
  },
  {
    id: "apple",
    label: "Continue with Apple",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M16.37 12.73c-.03-2.6 2.13-3.86 2.23-3.92-1.21-1.78-3.1-2.02-3.78-2.05-1.6-.16-3.13.95-3.95.95-.82 0-2.07-.93-3.4-.9a5.04 5.04 0 0 0-4.27 2.59c-1.83 3.17-.47 7.85 1.31 10.42.87 1.26 1.9 2.67 3.26 2.62 1.31-.05 1.8-.85 3.38-.85 1.58 0 2.02.85 3.4.82 1.41-.02 2.3-1.28 3.15-2.55a11.3 11.3 0 0 0 1.43-2.93 4.54 4.54 0 0 1-2.76-4.2ZM13.77 5.1A4.6 4.6 0 0 0 14.85 1.8a4.7 4.7 0 0 0-3.04 1.57 4.4 4.4 0 0 0-1.11 3.2 3.9 3.9 0 0 0 3.07-1.47Z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Continue with Facebook",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.23 2.68.23v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
      </svg>
    ),
  },
];

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

  async function continueWith(provider: OAuthProvider) {
    setBusy(true);
    rememberOAuthRedirect(redirect);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: oauthCallbackUrl(window.location.origin) },
    });
    // On success the browser navigates to the provider, so only errors land here.
    if (error) { setBusy(false); toast.error(error.message); }
  }

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
            <>
            <div className="grid gap-3">
              {PROVIDERS.map((p) => (
                <Button key={p.id} type="button" variant="outline" size="lg" className="h-12 gap-3 rounded-2xl" disabled={busy} onClick={() => continueWith(p.id)}>
                  {p.icon}
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or use email
              <div className="h-px flex-1 bg-border" />
            </div>
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
            </>
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
