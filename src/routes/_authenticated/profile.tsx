import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Download, KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Card } from "@/components/dearkin/AppShell";
import { Avatar, Field, NativeSelect } from "@/components/dearkin/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useVillage, roleLabel } from "@/lib/dearkin";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Dearkin" }, { name: "description", content: "Your Dearkin account and privacy." }] }),
  component: () => <AppShell><Profile /></AppShell>,
});

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function Profile() {
  const { me, current, isParent, isAdmin } = useVillage();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  if (!current) return null;
  const v = current.villages;
  const role = roleLabel(current.role, current.caregiver_kind);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function exportData(kind: "json" | "csv") {
    const [m, b] = await Promise.all([
      supabase.from("village_members").select("display_name, role, caregiver_kind, status").eq("village_id", v.id),
      supabase.from("care_blocks").select("date, start_time, end_time, child_alias, coverage_status, assigned_user_id").eq("village_id", v.id).order("date"),
    ]);
    const names = new Map<string, string>();
    const { data: mm } = await supabase.from("village_members").select("user_id, display_name").eq("village_id", v.id);
    mm?.forEach((x) => names.set(x.user_id, x.display_name));
    const blocks = (b.data ?? []).map(({ assigned_user_id, ...r }) => ({ ...r, assignee: assigned_user_id ? names.get(assigned_user_id) ?? "" : "" }));
    if (kind === "json") {
      download("dearkin-village.json", JSON.stringify({ village: { name: v.name, child_alias: v.child_alias, child_age_bracket: v.child_age_bracket, timezone: v.timezone }, members: m.data, care_blocks: blocks }, null, 2), "application/json");
    } else {
      const head = "date,start_time,end_time,child_alias,assignee,coverage_status";
      const rows = blocks.map((r) => [r.date, r.start_time, r.end_time, r.child_alias, r.assignee, r.coverage_status].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","));
      download("dearkin-care-blocks.csv", [head, ...rows].join("\n"), "text/csv");
    }
  }

  async function deleteVillage() {
    const { error } = await supabase.from("villages").delete().eq("id", v.id);
    if (error) { toast.error(error.message); return; }
    localStorage.removeItem("dearkin.village");
    toast.success("Village permanently deleted");
    setDeleting(false);
    await qc.invalidateQueries();
    navigate({ to: "/onboarding" });
  }

  return (
    <div className="grid gap-5">
      <h1 className="font-serif text-3xl md:text-4xl">Profile</h1>
      <Card className="flex items-center gap-4">
        <Avatar name={current.display_name} className="h-16 w-16 text-xl" />
        <div className="min-w-0">
          <div className="font-serif text-2xl">{current.display_name}</div>
          <div className="text-sm text-muted-foreground">{role} · {v.name}</div>
          <div className="truncate text-xs text-muted-foreground">{me.data?.user.email}</div>
        </div>
      </Card>

      <Card className="p-0">
        <dl className="divide-y divide-border">
          <Row k="Village" v={v.name} />
          <Row k="Role" v={role} />
          <Row k="Care visibility" v={isParent ? "All care blocks" : "Assigned to you only"} />
        </dl>
      </Card>

      <ChildCard villageId={v.id} alias={v.child_alias} bracket={v.child_age_bracket} canEdit={isAdmin} />

      {(me.data?.memberships.length ?? 0) > 1 && (
        <Card>
          <h2 className="font-serif text-xl">Switch village</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {me.data!.memberships.map((m) => (
              <Button key={m.id} variant={m.village_id === v.id ? "default" : "outline"} className="rounded-2xl"
                onClick={() => { localStorage.setItem("dearkin.village", m.village_id); qc.invalidateQueries(); }}>
                {m.villages.name}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <Setting icon={<Bell className="h-5 w-5" />} title="Care notifications" value="On" />
        <Setting icon={<ShieldCheck className="h-5 w-5" />} title="Privacy" value="Protected" sub="Day and care hours only" />
        <Setting icon={<KeyRound className="h-5 w-5" />} title="Village access" value={isAdmin ? "You manage access" : isParent ? "Full week" : "Assigned hours"} />
      </div>

      {isAdmin && (
        <Card>
          <h2 className="font-serif text-xl">Your data</h2>
          <p className="mt-1 text-sm text-muted-foreground">Download everything in this village, or delete it permanently.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => exportData("csv")}><Download className="h-4 w-4" /> Export CSV</Button>
            <Button variant="outline" className="rounded-2xl" onClick={() => exportData("json")}><Download className="h-4 w-4" /> Export JSON</Button>
            <Button variant="ghost" className="rounded-2xl text-destructive hover:text-destructive" onClick={() => setDeleting(true)}>Delete village</Button>
          </div>
        </Card>
      )}

      <Button variant="outline" size="lg" className="h-12 rounded-2xl" onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</Button>

      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete {v.name}?</AlertDialogTitle>
            <AlertDialogDescription>All members, invites and care blocks are erased. This can't be undone. Type the village name to confirm.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={v.name} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={confirmName !== v.name} onClick={deleteVillage}>Delete forever</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const AGES = { "0-3mo": "0–3 months", "3-12mo": "3–12 months", "1-2y": "1–2 years", "2-5y": "2–5 years" } as const;
type Age = keyof typeof AGES;

function ChildCard({ villageId, alias, bracket, canEdit }: { villageId: string; alias: string; bracket: Age; canEdit: boolean }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(alias);
  const [age, setAge] = useState<Age>(bracket);
  const [busy, setBusy] = useState(false);

  async function save() {
    const n = name.trim();
    if (!n || n.length > 30) { toast.error("Use a first name or nickname (up to 30 characters)"); return; }
    setBusy(true);
    const { error } = await supabase.from("villages").update({ child_alias: n, child_age_bracket: age }).eq("id", villageId);
    if (!error && n !== alias) await supabase.from("care_blocks").update({ child_alias: n }).eq("village_id", villageId);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Child info updated");
    setEditing(false);
    qc.invalidateQueries();
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Child</h2>
        {canEdit && !editing && <Button variant="ghost" size="sm" onClick={() => { setName(alias); setAge(bracket); setEditing(true); }}>Edit</Button>}
      </div>
      {editing ? (
        <div className="mt-3 grid gap-3">
          <Field label="First name or nickname"><Input maxLength={30} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Age">
            <NativeSelect value={age} onChange={(x) => setAge(x as Age)}>
              {Object.entries(AGES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </NativeSelect>
          </Field>
          <p className="text-xs text-muted-foreground">Nickname only — we never store a child's full name.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setEditing(false)}>Cancel</Button>
            <Button className="flex-1 rounded-2xl" disabled={busy} onClick={save}>Save</Button>
          </div>
        </div>
      ) : (
        <dl className="mt-2 divide-y divide-border">
          <div className="flex justify-between py-3"><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{alias}</dd></div>
          <div className="flex justify-between py-3"><dt className="text-muted-foreground">Age</dt><dd className="font-medium">{AGES[bracket]}</dd></div>
        </dl>
      )}
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between px-5 py-4"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>;
}
function Setting({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub?: string }) {
  return (
    <Card>
      <div className="text-primary">{icon}</div>
      <div className="mt-3 text-sm text-muted-foreground">{title}</div>
      <div className="font-serif text-xl">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}
