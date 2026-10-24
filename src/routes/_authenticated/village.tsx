import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, ShieldCheck, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Card } from "@/components/dearkin/AppShell";
import { Avatar, Field, NativeSelect } from "@/components/dearkin/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useVillage, roleLabel, roleDescription, useRefresh, type Member, type Role, type CaregiverKind } from "@/lib/dearkin";

export const Route = createFileRoute("/_authenticated/village")({
  head: () => ({ meta: [{ title: "My Village — Dearkin" }, { name: "description", content: "The trusted people in your village." }] }),
  component: () => <AppShell><VillageView /></AppShell>,
});

const ROLE_OPTIONS: Record<string, { role: Role; kind: CaregiverKind; label: string }> = {
  co_parent: { role: "co_parent", kind: "none", label: "Co-parent" },
  nanny: { role: "caregiver", kind: "nanny", label: "Nanny" },
  family: { role: "caregiver", kind: "family", label: "Family caregiver" },
  sitter: { role: "caregiver", kind: "sitter", label: "Regular sitter" },
};

function VillageView() {
  const { current, isParent, isAdmin, members, userId } = useVillage();
  const refresh = useRefresh();
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<Member | null>(null);
  const invites = useQuery({
    enabled: isAdmin && !!current,
    queryKey: ["invites", current?.village_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("invites").select("*").eq("village_id", current!.village_id).eq("status", "pending").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (!current) return null;

  const copy = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`);
    toast.success("Invite link copied");
  };

  return (
    <div className="grid gap-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">{current.villages.name}</h1>
          <p className="mt-1 text-muted-foreground">Caring for {current.villages.child_alias}</p>
        </div>
        {isAdmin && <Button className="h-11 rounded-2xl" onClick={() => setInviting(true)}><UserPlus className="h-4 w-4" /> Invite</Button>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="font-serif text-xl">{isParent ? "Members" : "Who you'll coordinate with"}</h2>
          <ul className="mt-3 divide-y divide-border">
            {(members.data ?? []).map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <Avatar name={m.display_name} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{m.display_name}{m.user_id === userId && " (you)"}</div>
                  <div className="truncate text-sm text-muted-foreground">{roleDescription(m.role, m.caregiver_kind)}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.role === "caregiver" ? "bg-amber text-amber-foreground" : "bg-sage text-sage-foreground"}`}>{roleLabel(m.role, m.caregiver_kind)}</span>
                {isAdmin && m.user_id !== userId && (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setRemoving(m)}>Remove</Button>
                )}
              </li>
            ))}
          </ul>
          {isAdmin && (invites.data?.length ?? 0) > 0 && (
            <>
              <h3 className="mt-4 text-sm font-semibold text-muted-foreground">Pending invites</h3>
              <ul className="mt-2 grid gap-2">
                {invites.data!.map((i) => (
                  <li key={i.id} className="flex items-center gap-2 rounded-2xl bg-muted p-3 text-sm">
                    <div className="min-w-0 flex-1"><div className="font-medium">{i.display_name}</div><div className="truncate text-xs text-muted-foreground">{i.invited_email}</div></div>
                    <Button size="sm" variant="outline" onClick={() => copy(i.token)}><Copy className="h-3.5 w-3.5" /> Link</Button>
                    <Button size="sm" variant="ghost" onClick={async () => { await supabase.from("invites").update({ status: "revoked" }).eq("id", i.id); refresh(); }}>Revoke</Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <section className="rounded-3xl bg-forest p-6 text-forest-foreground shadow-soft">
          <ShieldCheck className="h-6 w-6" />
          {isParent ? (
            <>
              <h2 className="mt-3 font-serif text-2xl">Only what coordination requires</h2>
              <ul className="mt-4 grid gap-2 text-sm opacity-90">
                <li>• Day and care hours only — share care, not whereabouts.</li>
                <li>• Caregivers see only the blocks assigned to them.</li>
                <li>• No location, notes, profiles, photos or ads.</li>
                <li>• Removing someone ends their access immediately.</li>
              </ul>
            </>
          ) : (
            <>
              <h2 className="mt-3 font-serif text-2xl">Your view stays focused</h2>
              <p className="mt-3 text-sm opacity-90">You only see the care hours assigned to you — never the family's full week. Only the day and hours are shared. Share care, not whereabouts.</p>
            </>
          )}
        </section>
      </div>

      {isAdmin && <InviteDialog open={inviting} onOpenChange={setInviting} villageId={current.village_id} onCreated={copy} />}

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.display_name}?</AlertDialogTitle>
            <AlertDialogDescription>They lose access right away. Any upcoming care assigned to them becomes a gap.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                const { error } = await supabase.rpc("remove_member", { _member: removing!.id });
                if (error) toast.error(error.message); else toast.success("Member removed");
                setRemoving(null); refresh();
              }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InviteDialog({ open, onOpenChange, villageId, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; villageId: string; onCreated: (token: string) => void }) {
  const refresh = useRefresh();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState("nanny");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const opt = ROLE_OPTIONS[kind]!;
    const { data, error } = await supabase.from("invites")
      .insert({ village_id: villageId, display_name: name.trim(), invited_email: email.trim().toLowerCase(), role: opt.role, caregiver_kind: opt.kind })
      .select("token").single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setLink(data.token);
    onCreated(data.token);
    refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setLink(null); setName(""); setEmail(""); } }}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Invite to your village</DialogTitle>
          <DialogDescription>They'll only see day and care hours. Links expire in 7 days.</DialogDescription>
        </DialogHeader>
        {link ? (
          <div className="grid gap-3">
            <p className="text-sm">Invite created and link copied. Send it to {name} — they'll sign in with <b>{email}</b> to join.</p>
            <div className="break-all rounded-2xl bg-muted p-3 text-xs">{window.location.origin}/invite/{link}</div>
            <Button onClick={() => onOpenChange(false)} className="h-12 rounded-2xl">Done</Button>
          </div>
        ) : (
          <form onSubmit={send} className="grid gap-4">
            <Field label="Name"><Input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Role">
              <NativeSelect value={kind} onChange={setKind}>
                {Object.entries(ROLE_OPTIONS).map(([k, o]) => <option key={k} value={k}>{o.label}</option>)}
              </NativeSelect>
            </Field>
            <Button className="h-12 rounded-2xl" disabled={busy}>Create invite</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
