import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  STATUS, fmt, fmtRange, memberName, initials, isGap, useRefresh, roleLabel,
  type Block, type CoverageStatus, type Member, type Membership,
} from "@/lib/dearkin";

export function StatusTag({ status }: { status: CoverageStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage font-semibold text-sage-foreground ${className}`}>
      {initials(name)}
    </span>
  );
}

export function BlockRow({ block, members, onClick }: { block: Block; members?: Member[] | undefined; onClick: () => void }) {
  const gap = isGap(block.coverage_status);
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors hover:bg-accent/50 ${gap ? "border-coral bg-coral/20" : "border-border bg-card"}`}
    >
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-foreground">{fmtRange(block)}</div>
        <div className="mt-0.5 truncate text-sm text-muted-foreground">
          {block.child_alias} · {memberName(members, block.assigned_user_id)}
        </div>
      </div>
      <StatusTag status={block.coverage_status} />
    </button>
  );
}

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "Something went wrong";
}

export function AddCareDialog({
  open, onOpenChange, current, members, defaultDate,
}: { open: boolean; onOpenChange: (o: boolean) => void; current: Membership; members: Member[]; defaultDate: string }) {
  const refresh = useRefresh();
  const [date, setDate] = useState(defaultDate);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("13:00");
  const [assignee, setAssignee] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setDate(defaultDate); }, [open, defaultDate]);

  async function save() {
    if (end === start) { toast.error("Start and end can't be the same time"); return; }
    setBusy(true);
    const me = (await supabase.auth.getUser()).data.user!.id;
    const { error } = await supabase.from("care_blocks").insert({
      village_id: current.village_id,
      child_alias: current.villages.child_alias,
      date, start_time: start, end_time: end,
      assigned_user_id: assignee || null,
      coverage_status: !assignee ? "needs_coverage" : assignee === me ? "parent_covered" : "pending",
      created_by: me,
    });
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success(assignee ? "Care added — waiting on a reply" : "Care added as an open gap");
    onOpenChange(false);
    setAssignee("");
    refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add care</DialogTitle>
          <DialogDescription>Only the day and care hours are shared.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Day"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Child"><Input value={current.villages.child_alias} disabled /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts"><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
            <Field label="Ends"><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
          </div>
          {end < start && <p className="-mt-2 text-xs text-muted-foreground">Overnight care — ends the next morning.</p>}
          <Field label="Ask someone (optional)">
            <NativeSelect value={assignee} onChange={setAssignee}>
              <option value="">Leave open — needs coverage</option>
              {members.map((m) => (
                <option key={m.id} value={m.user_id}>{m.display_name} · {roleLabel(m.role, m.caregiver_kind)}</option>
              ))}
            </NativeSelect>
          </Field>
          <Button size="lg" className="h-12 rounded-2xl" disabled={busy} onClick={save}>Add care</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-sm font-medium leading-none">{label}</span>{children}</label>;
}

export function NativeSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-md border border-input bg-card px-3 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {children}
    </select>
  );
}

export async function askMember(block: Block, userId: string, selfId: string) {
  const { error } = await supabase
    .from("care_blocks")
    .update({ assigned_user_id: userId, coverage_status: userId === selfId ? "parent_covered" : "pending" })
    .eq("id", block.id);
  if (error) throw error;
}

export function BlockDetailDialog({
  block, onClose, members, isParent, userId,
}: { block: Block | null; onClose: () => void; members: Member[]; isParent: boolean; userId: string }) {
  const refresh = useRefresh();
  const [busy, setBusy] = useState(false);
  const [askId, setAskId] = useState("");
  const [edit, setEdit] = useState({ date: "", start: "", end: "" });
  useEffect(() => {
    if (block) {
      setEdit({ date: block.date, start: block.start_time.slice(0, 5), end: block.end_time.slice(0, 5) });
      setAskId("");
    }
  }, [block]);
  if (!block) return null;
  const mine = block.assigned_user_id === userId;
  const gap = isGap(block.coverage_status);

  async function run(fn: () => Promise<unknown>, msg: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(msg);
      refresh();
      onClose();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }
  const rpc = async (name: "confirm_block" | "flag_conflict") => {
    const { error } = await supabase.rpc(name, { _block: block.id });
    if (error) throw error;
  };
  const others = members.filter((m) => m.user_id !== block.assigned_user_id);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{fmt(block.date, { weekday: "long", month: "short", day: "numeric" })}</DialogTitle>
          <DialogDescription>{fmtRange(block)} · {block.child_alias}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
          <div>
            <div className="text-xs text-muted-foreground">Assigned to</div>
            <div className="font-semibold">{mine ? "You" : memberName(members, block.assigned_user_id)}</div>
          </div>
          <StatusTag status={block.coverage_status} />
        </div>

        {mine && block.coverage_status !== "parent_covered" && (
          <div className="grid gap-2">
            {block.coverage_status !== "confirmed" && (
              <Button size="lg" className="h-12 rounded-2xl" disabled={busy} onClick={() => run(() => rpc("confirm_block"), "Hours confirmed")}>
                Confirm hours
              </Button>
            )}
            <Button size="lg" variant="outline" className="h-12 rounded-2xl" disabled={busy} onClick={() => run(() => rpc("flag_conflict"), "Conflict flagged — the family will see a gap")}>
              Flag a conflict
            </Button>
          </div>
        )}

        {isParent && (
          <div className="grid gap-4 border-t border-border pt-4">
            {(gap || block.coverage_status === "pending") && others.length > 0 && (
              <div className="grid gap-2">
                <Label>{gap ? "Fill this gap" : "Ask someone else"}</Label>
                <div className="flex gap-2">
                  <NativeSelect value={askId} onChange={setAskId}>
                    <option value="">Choose a person…</option>
                    {others.map((m) => <option key={m.id} value={m.user_id}>{m.user_id === userId ? "Me" : m.display_name}</option>)}
                  </NativeSelect>
                  <Button
                    disabled={!askId || busy}
                    onClick={() => run(() => askMember(block, askId, userId), askId === userId ? "You're covering it" : `Asked ${memberName(members, askId)}`)}
                  >
                    {askId === userId ? "Cover" : `Ask${askId ? " " + memberName(members, askId) : ""}`}
                  </Button>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Edit hours</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} className="col-span-3" />
                <Input type="time" value={edit.start} onChange={(e) => setEdit({ ...edit, start: e.target.value })} />
                <Input type="time" value={edit.end} onChange={(e) => setEdit({ ...edit, end: e.target.value })} />
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      if (edit.end === edit.start) throw new Error("Start and end can't be the same time");
                      const { error } = await supabase.from("care_blocks")
                        .update({ date: edit.date, start_time: edit.start, end_time: edit.end }).eq("id", block.id);
                      if (error) throw error;
                    }, "Hours updated")
                  }
                >Save</Button>
              </div>
            </div>
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => run(async () => {
                const { error } = await supabase.from("care_blocks").delete().eq("id", block.id);
                if (error) throw error;
              }, "Care block removed")}
            >Remove this block</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
