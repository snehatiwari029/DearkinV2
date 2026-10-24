import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Role = Database["public"]["Enums"]["member_role"];
export type CaregiverKind = Database["public"]["Enums"]["caregiver_kind"];
export type CoverageStatus = Database["public"]["Enums"]["coverage_status"];
export type Village = Database["public"]["Tables"]["villages"]["Row"];
export type Member = Database["public"]["Tables"]["village_members"]["Row"];
export type Block = Database["public"]["Tables"]["care_blocks"]["Row"];
export type Invite = Database["public"]["Tables"]["invites"]["Row"];

export type Membership = Member & { villages: Village };

export const STATUS: Record<CoverageStatus, { label: string; cls: string; dot: string }> = {
  confirmed: { label: "Confirmed", cls: "bg-sage text-sage-foreground", dot: "bg-primary" },
  pending: { label: "Awaiting reply", cls: "bg-amber text-amber-foreground", dot: "bg-amber-foreground" },
  needs_coverage: { label: "Needs coverage", cls: "bg-coral text-coral-foreground", dot: "bg-coral-foreground" },
  conflict_flagged: { label: "Conflict flagged", cls: "bg-coral text-coral-foreground", dot: "bg-coral-foreground" },
  parent_covered: { label: "Parent covering", cls: "bg-teal text-teal-foreground", dot: "bg-teal-foreground" },
  completed: { label: "Completed", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

export const isGap = (s: CoverageStatus) => s === "needs_coverage" || s === "conflict_flagged";
export const isCovered = (s: CoverageStatus) => s === "confirmed" || s === "parent_covered" || s === "completed";

export function roleLabel(role: Role, kind: CaregiverKind) {
  if (role === "parent_admin") return "Parent admin";
  if (role === "co_parent") return "Co-parent";
  return { nanny: "Nanny", family: "Family caregiver", sitter: "Regular sitter", none: "Caregiver" }[kind];
}
export function roleDescription(role: Role, kind: CaregiverKind) {
  if (role === "parent_admin") return "Manages the village and all care";
  if (role === "co_parent") return "Sees the full week, adds care";
  return {
    nanny: "Sees only hours assigned to them",
    family: "Family member, sees assigned hours",
    sitter: "Regular sitter, sees assigned hours",
    none: "Sees assigned hours",
  }[kind];
}
export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");

// ---------- dates (all as YYYY-MM-DD strings in the village timezone) ----------
export function todayIn(tz: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export function hourIn(tz: string) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(new Date()));
}
const toDate = (d: string) => new Date(d + "T12:00:00Z");
export function addDays(d: string, n: number) {
  const x = toDate(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
}
export const weekDays = (start: string) => Array.from({ length: 7 }, (_, i) => addDays(start, i));
export const fmt = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(toDate(d));
export const weekday = (d: string) => fmt(d, { weekday: "long" });
export function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ap = h! >= 12 ? "PM" : "AM";
  const hh = h! % 12 || 12;
  return m ? `${hh}:${String(m).padStart(2, "0")} ${ap}` : `${hh} ${ap}`;
}
export const isOvernight = (b: Pick<Block, "start_time" | "end_time">) => b.end_time.slice(0, 5) < b.start_time.slice(0, 5);
export const fmtRange = (b: Pick<Block, "start_time" | "end_time">) =>
  `${fmtTime(b.start_time)} – ${fmtTime(b.end_time)}${isOvernight(b) ? " (next day)" : ""}`;
export const numberWord = (n: number) => ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven"][n] ?? String(n);

// ---------- data hooks ----------
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return null;
      const { data: rows, error } = await supabase
        .from("village_members")
        .select("*, villages(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at");
      if (error) throw error;
      const memberships = (rows ?? []) as Membership[];
      const stored = typeof window !== "undefined" ? localStorage.getItem("dearkin.village") : null;
      const current = memberships.find((m) => m.village_id === stored) ?? memberships[0] ?? null;
      return { user, memberships, current };
    },
  });
}

/** Everything a tab screen needs. Null until loaded. */
export function useVillage() {
  const me = useMe();
  const current = me.data?.current ?? null;
  const isParent = current ? current.role !== "caregiver" : false;
  const villageId = current?.village_id;
  const userId = me.data?.user.id;

  const members = useQuery({
    enabled: !!villageId,
    queryKey: ["members", villageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("village_members")
        .select("*")
        .eq("village_id", villageId!)
        .eq("status", "active")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  // Caregivers: RLS already limits to their own blocks; we also filter explicitly.
  const blocks = useQuery({
    enabled: !!villageId && !!userId,
    queryKey: ["blocks", villageId, isParent],
    queryFn: async () => {
      let q = supabase.from("care_blocks").select("*").order("date").order("start_time");
      q = isParent ? q.eq("village_id", villageId!) : q.eq("assigned_user_id", userId!);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  return { me, current, isParent, isAdmin: current?.role === "parent_admin", members, blocks, userId };
}

export function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}

export function memberName(members: Member[] | undefined, userId: string | null) {
  if (!userId) return "Unassigned";
  return members?.find((m) => m.user_id === userId)?.display_name ?? "Member";
}

export function greeting(tz: string) {
  const h = hourIn(tz);
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function coverageSummary(dayBlocks: Block[], weekBlocks: Block[], day: string) {
  const name = weekday(day);
  let first: string;
  if (dayBlocks.length === 0) first = `Nothing scheduled ${name}.`;
  else if (dayBlocks.some((b) => isGap(b.coverage_status))) first = `${name} has a gap.`;
  else if (dayBlocks.every((b) => isCovered(b.coverage_status))) first = `${name} is covered.`;
  else first = `${name} is waiting on a reply.`;
  const gaps = weekBlocks.filter((b) => isGap(b.coverage_status)).length;
  const second = gaps === 0 ? "No gaps this week." : `${numberWord(gaps)} gap${gaps > 1 ? "s" : ""} need${gaps > 1 ? "" : "s"} attention this week.`;
  return `${first} ${second}`;
}
