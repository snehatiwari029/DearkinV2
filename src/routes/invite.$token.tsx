import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { roleLabel, type Role, type CaregiverKind } from "@/lib/dearkin";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "You're invited — Dearkin" },
      { name: "description", content: "Join a private Dearkin village." },
      { property: "og:title", content: "You're invited — Dearkin" },
      { property: "og:description", content: "Join a private Dearkin village. Share care, not whereabouts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvitePage,
});

type Info = { village_name: string; role: Role; caregiver_kind: CaregiverKind; invited_email: string; display_name: string; valid: boolean };

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "signed_out" | "ready" | "missing">("loading");
  const [info, setInfo] = useState<Info | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { setState("signed_out"); return; }
      const { data: rows } = await supabase.rpc("get_invite", { _token: token });
      if (!rows?.[0]) { setState("missing"); return; }
      setInfo(rows[0]);
      setState("ready");
    })();
  }, [token]);

  async function accept() {
    setBusy(true);
    const { error } = await supabase.rpc("accept_invite", { _token: token });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    localStorage.removeItem("dearkin.village");
    toast.success("Welcome to the village");
    navigate({ to: "/today" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-5">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
        <h1 className="font-serif text-3xl">You're invited</h1>
        {state === "loading" && <p className="mt-3 text-muted-foreground">Checking your invite…</p>}
        {state === "signed_out" && (
          <>
            <p className="mt-3 text-sm text-muted-foreground">Sign in or create an account with the email this invite was sent to.</p>
            <Button asChild size="lg" className="mt-5 h-12 w-full rounded-2xl">
              <Link to="/auth" search={{ redirect: `/invite/${token}` }}>Continue</Link>
            </Button>
          </>
        )}
        {state === "missing" && <p className="mt-3 text-sm text-muted-foreground">This invite link isn't valid.</p>}
        {state === "ready" && info && (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Join <b className="text-foreground">{info.village_name}</b> as {roleLabel(info.role, info.caregiver_kind)}.
              You'll only ever see day and care hours.
            </p>
            {info.valid ? (
              <Button size="lg" className="mt-5 h-12 w-full rounded-2xl" disabled={busy} onClick={accept}>Join village</Button>
            ) : (
              <p className="mt-4 text-sm text-coral-foreground">This invite has expired or was already used.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
