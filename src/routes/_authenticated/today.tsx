import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card } from "@/components/dearkin/AppShell";
import { AddCareDialog, Avatar, BlockDetailDialog, BlockRow, askMember } from "@/components/dearkin/blocks";
import { Button } from "@/components/ui/button";
import {
  useVillage, todayIn, weekDays, fmt, weekday, isGap, isCovered, numberWord, greeting, roleLabel,
  fmtRange, useRefresh, coverageSummary, type Block,
} from "@/lib/dearkin";

export const Route = createFileRoute("/_authenticated/today")({
  head: () => ({ meta: [{ title: "Today — Dearkin" }, { name: "description", content: "Today's care coverage at a glance." }] }),
  component: () => <AppShell><Today /></AppShell>,
});

function Today() {
  const { me, current, isParent, members, blocks, userId } = useVillage();
  const refresh = useRefresh();
  const tz = current?.villages.timezone ?? "America/Los_Angeles";
  const today = todayIn(tz);
  const [selected, setSelected] = useState(today);
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Block | null>(null);
  if (!current || !userId) return null;

  const days = weekDays(today);
  const all = blocks.data ?? [];
  const week = all.filter((b) => b.date >= days[0]! && b.date <= days[6]!);
  const dayBlocks = all.filter((b) => b.date === selected);
  const firstName = (me.data?.user.user_metadata?.["first_name"] as string | undefined) ?? current.display_name;
  const counts = {
    confirmed: week.filter((b) => isCovered(b.coverage_status)).length,
    pending: week.filter((b) => b.coverage_status === "pending").length,
    gaps: week.filter((b) => isGap(b.coverage_status)).length,
  };
  const nextGap = all.find((b) => b.date >= today && isGap(b.coverage_status));
  const askable = (members.data ?? []).filter((m) => m.user_id !== userId);

  const summary = isParent
    ? coverageSummary(all.filter((b) => b.date === today), week, today)
    : week.length === 0
      ? "No care assigned to you this week."
      : `You have ${numberWord(week.length).toLowerCase()} care block${week.length > 1 ? "s" : ""} this week${counts.pending ? `, ${counts.pending} awaiting your reply` : ""}.`;

  return (
    <div className="grid gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground md:text-4xl">{greeting(tz)}, {firstName}</h1>
          <p className="mt-1 text-muted-foreground">{summary}</p>
        </div>
        {isParent && (
          <Button onClick={() => setAdding(true)} className="hidden h-11 rounded-2xl md:inline-flex"><Plus className="h-4 w-4" /> Add care</Button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d) => {
              const db = all.filter((b) => b.date === d);
              const dot = db.length === 0 ? "bg-transparent" : db.some((b) => isGap(b.coverage_status)) ? "bg-coral-foreground" : db.some((b) => b.coverage_status === "pending") ? "bg-amber-foreground" : "bg-primary";
              const on = d === selected;
              return (
                <button key={d} onClick={() => setSelected(d)}
                  className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs transition-colors ${on ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                  <span className={on ? "opacity-80" : "text-muted-foreground"}>{fmt(d, { weekday: "short" })}</span>
                  <span className="text-lg font-semibold">{fmt(d, { day: "numeric" })}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${on && db.length ? "bg-primary-foreground" : dot}`} />
                </button>
              );
            })}
          </div>
          <h2 className="mt-5 mb-3 font-serif text-xl">{selected === today ? "Today" : weekday(selected)}, {fmt(selected, { month: "short", day: "numeric" })}</h2>
          <div className="grid gap-2">
            {dayBlocks.length === 0 && <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">{isParent ? "No care set for this day." : "Nothing assigned to you this day."}</p>}
            {dayBlocks.map((b) => <BlockRow key={b.id} block={b} members={members.data} onClick={() => setDetail(b)} />)}
          </div>
        </Card>

        <div className="grid content-start gap-5">
          <Card>
            <h2 className="font-serif text-xl">Week at a glance</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat n={counts.confirmed} label="Confirmed" cls="bg-sage text-sage-foreground" />
              <Stat n={counts.pending} label="Awaiting" cls="bg-amber text-amber-foreground" />
              <Stat n={counts.gaps} label="Open gaps" cls="bg-coral text-coral-foreground" />
            </div>
          </Card>

          {isParent && nextGap && (
            <Card className="border-coral">
              <div className="flex items-center gap-2 text-sm font-semibold text-coral-foreground"><AlertCircle className="h-4 w-4" /> Needs attention</div>
              <p className="mt-2 font-serif text-xl">{weekday(nextGap.date)} · {fmtRange(nextGap)}</p>
              <p className="text-sm text-muted-foreground">{nextGap.child_alias} still needs someone.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {askable.slice(0, 3).map((m, i) => (
                  <Button key={m.id} variant={i === 0 ? "default" : "outline"} className="h-11 rounded-2xl"
                    onClick={async () => {
                      try { await askMember(nextGap, m.user_id, userId); toast.success(`Asked ${m.display_name}`); refresh(); }
                      catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't ask"); }
                    }}>
                    Ask {m.display_name}
                  </Button>
                ))}
                <Button variant="ghost" className="h-11 rounded-2xl" onClick={() => setDetail(nextGap)}>More</Button>
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl">{isParent ? "Your village" : current.villages.name}</h2>
              <Link to="/village" className="text-sm font-medium text-primary">See all</Link>
            </div>
            <ul className="mt-3 grid gap-3">
              {(members.data ?? []).slice(0, 4).map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <Avatar name={m.display_name} />
                  <div><div className="font-medium">{m.display_name}{m.user_id === userId && " (you)"}</div><div className="text-xs text-muted-foreground">{roleLabel(m.role, m.caregiver_kind)}</div></div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {isParent && (
        <Button onClick={() => setAdding(true)} size="lg" className="fixed bottom-24 right-5 z-30 h-14 rounded-full px-6 shadow-soft md:hidden">
          <Plus className="h-5 w-5" /> Add care
        </Button>
      )}
      <AddCareDialog open={adding} onOpenChange={setAdding} current={current} members={members.data ?? []} defaultDate={selected} />
      <BlockDetailDialog block={detail} onClose={() => setDetail(null)} members={members.data ?? []} isParent={isParent} userId={userId} />
    </div>
  );
}

function Stat({ n, label, cls }: { n: number; label: string; cls: string }) {
  return (
    <div className={`rounded-2xl p-3 ${cls}`}>
      <div className="font-serif text-3xl">{n}</div>
      <div className="text-xs font-semibold">{label}</div>
    </div>
  );
}
