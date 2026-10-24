import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Sun, Users, UserRound } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useMe } from "@/lib/dearkin";

const tabs = [
  { to: "/today", label: "Today", icon: Sun },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/village", label: "Village", icon: Users },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const me = useMe();
  const navigate = useNavigate();
  useEffect(() => {
    if (me.data && !me.data.current) navigate({ to: "/onboarding", replace: true });
  }, [me.data, navigate]);

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card md:px-5 md:py-8 md:sticky md:top-0 md:h-screen">
        <Brand />
        <nav className="mt-10 flex flex-col gap-1">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "!bg-accent !text-accent-foreground" }}
            >
              <t.icon className="h-5 w-5" /> {t.label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto text-xs leading-relaxed text-muted-foreground">Share care, not whereabouts.</p>
      </aside>

      <div className="flex-1 pb-28 md:pb-12">
        <header className="flex items-center justify-between px-5 pt-5 md:hidden">
          <Brand />
        </header>
        <main className="mx-auto w-full max-w-5xl px-5 pt-5 md:px-10 md:pt-10">
          {me.isLoading ? <div className="py-20 text-center text-muted-foreground">Loading your village…</div> : children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground"
              activeProps={{ className: "!text-primary" }}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function Brand() {
  return (
    <Link to="/today" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary font-serif text-lg text-primary-foreground">d</span>
      <span className="font-serif text-2xl text-foreground">Dearkin</span>
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-border bg-card p-5 shadow-soft ${className}`}>{children}</section>;
}
