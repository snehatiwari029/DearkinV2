import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell, Card } from "@/components/dearkin/AppShell";
import { AddCareDialog, BlockDetailDialog, StatusTag } from "@/components/dearkin/blocks";
import { Button } from "@/components/ui/button";
import { useVillage, todayIn, weekDays, addDays, fmt, fmtRange, memberName, isGap, isCovered, type Block, type CoverageStatus } from "@/lib/dearkin";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Care Calendar — Dearkin" }, { name: "description", content: "Your week of care blocks." }] }),
  component: () => <AppShell><CalendarView /></AppShell>,
});

const FILTERS = ["confirmed", "pending", "needs_coverage"] as const;
type Filter = (typeof FILTERS)[number];
function matches(s: CoverageStatus, f: Filter | null) {
  if (!f) return true;
  if (f === "needs_coverage") return isGap(s);
  if (f === "confirmed") return isCovered(s);
  return s === f;
}

function CalendarView() {
  const { current, isParent, members, blocks, userId } = useVillage();
  const tz = current?.villages.timezone ?? "America/Los_Angeles";
  const today = todayIn(tz);
  const [start, setStart] = useState(today);
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Block | null>(null);
  const [filter, setFilter] = useState<Filter | null>(null);
  if (!current || !userId) return null;
  const days = weekDays(start);
  const all = blocks.data ?? [];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">{isParent ? "Care Calendar" : "Your care hours"}</h1>
          <p className="mt-1 text-muted-foreground">{fmt(days[0]!, { month: "short", day: "numeric" })} – {fmt(days[6]!, { month: "short", day: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl" aria-label="Previous week" onClick={() => setStart(addDays(start, -7))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" className="h-11 rounded-2xl" onClick={() => setStart(today)}>This week</Button>
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl" aria-label="Next week" onClick={() => setStart(addDays(start, 7))}><ChevronRight className="h-4 w-4" /></Button>
          {isParent && <Button className="h-11 rounded-2xl" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add care</Button>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(filter === f ? null : f)} aria-pressed={filter === f}
            className={`rounded-full transition-opacity ${filter && filter !== f ? "opacity-40" : ""} ${filter === f ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
            <StatusTag status={f} />
          </button>
        ))}
        {filter && <button onClick={() => setFilter(null)} className="text-xs font-medium text-primary underline">Show all</button>}
      </div>

      <div className="grid gap-3 lg:grid-cols-7">
        {days.map((d) => {
          const db = all.filter((b) => b.date === d && matches(b.coverage_status, filter));
          const isToday = d === today;
          return (
            <Card key={d} className={`p-3 lg:min-h-64 ${isToday ? "ring-2 ring-primary" : ""}`}>
              <div className="mb-2 flex items-baseline justify-between lg:block">
                <div className={`text-xs font-semibold uppercase tracking-wide ${isToday ? "text-primary" : "text-muted-foreground"}`}>{isToday ? "Today" : fmt(d, { weekday: "short" })}</div>
                <div className="font-serif text-xl">{fmt(d, { month: "short", day: "numeric" })}</div>
              </div>
              <div className="grid gap-2">
                {db.length === 0 && <div className="text-xs text-muted-foreground">—</div>}
                {db.map((b) => (
                  <button key={b.id} onClick={() => setDetail(b)}
                    className={`rounded-xl border p-2.5 text-left text-xs transition-colors hover:bg-accent/50 ${isGap(b.coverage_status) ? "border-coral bg-coral/25" : b.coverage_status === "pending" ? "border-amber bg-amber/30" : "border-border bg-sage/40"}`}>
                    <div className="font-semibold text-foreground">{fmtRange(b)}</div>
                    <div className="truncate text-muted-foreground">{b.child_alias} · {b.assigned_user_id === userId ? "You" : memberName(members.data, b.assigned_user_id)}</div>
                    <div className="mt-1.5"><StatusTag status={b.coverage_status} /></div>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <AddCareDialog open={adding} onOpenChange={setAdding} current={current} members={members.data ?? []} defaultDate={start} />
      <BlockDetailDialog block={detail} onClose={() => setDetail(null)} members={members.data ?? []} isParent={isParent} userId={userId} />
    </div>
  );
}
