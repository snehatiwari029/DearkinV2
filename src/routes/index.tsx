import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Dearkin — Build your village with confidence";
const DESC =
  "The calm, private way for busy families to coordinate who's covering their child — by day and hours.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

const btnPrimary =
  "inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-soft transition-colors hover:bg-forest";
const btnQuiet =
  "inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-base font-medium text-primary transition-colors hover:bg-accent";

const steps = [
  ["Invite your village", "Add the people you trust: co-parent, nanny, grandparent, regular sitter. Invite-only, always."],
  ["Set the week", "Add care blocks by day and hours, or start from a template like Parent + Nanny Weekdays."],
  ["Glance and go", "Green means covered. When a gap appears, ask someone with one tap — they confirm with one tap."],
] as const;

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link to="/" className="font-serif text-2xl text-primary">Dearkin</Link>
        <Link to="/auth" className="text-sm font-medium text-primary hover:underline">Sign in</Link>
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-5 pb-16 pt-8 sm:space-y-24 sm:pt-16">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Privacy-first childcare OS</p>
          <h1 className="mt-3 text-4xl leading-tight text-forest sm:text-6xl">Build your village with confidence.</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Dearkin is the calm, private way for busy families to coordinate who's covering their child — by day and hours. One glance tells you the week is covered.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/auth" className={btnPrimary}>Create your village</Link>
            <Link to="/auth" className={btnQuiet}>Sign in</Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Invite-only · No location tracking · No ads, ever</p>
        </section>

        <section className="max-w-3xl">
          <h2 className="text-3xl text-forest sm:text-4xl">One shared plan for the people who care for your child.</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Dearkin is your family's childcare operating system. Parents set the week, caregivers confirm with one tap, and everyone sees exactly what they need — nothing more. Green means covered. Amber means waiting on a reply. Coral means a gap needs attention.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
            <span className="rounded-full bg-sage px-3 py-1 text-sage-foreground">Covered</span>
            <span className="rounded-full bg-amber px-3 py-1 text-amber-foreground">Waiting on a reply</span>
            <span className="rounded-full bg-coral px-3 py-1 text-coral-foreground">Gap needs attention</span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {[
            ["For parents", "See your entire week in under ten seconds. Fill gaps by asking someone directly — no group-chat archaeology, no Sunday-night spreadsheet."],
            ["For nannies and caregivers", "See only the hours assigned to you. Confirm with one tap, flag a conflict just as easily. Your view stays focused — never the family's full calendar."],
          ].map(([h, b]) => (
            <div key={h} className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <h3 className="text-2xl text-forest">{h}</h3>
              <p className="mt-3 text-muted-foreground">{b}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-3xl text-forest sm:text-4xl">How it helps</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map(([h, b], i) => (
              <li key={h} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-sage font-serif text-lg text-sage-foreground">{i + 1}</span>
                <h3 className="mt-4 text-xl text-forest">{h}</h3>
                <p className="mt-2 text-muted-foreground">{b}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl bg-forest p-8 text-forest-foreground sm:p-12">
          <h2 className="text-3xl sm:text-4xl">Share care, not whereabouts.</h2>
          <p className="mt-4 max-w-2xl text-lg opacity-90">
            Dearkin shares only day and care hours with people you invite. Caregivers see only their assigned blocks. No location tracking, no care notes, no photos, no ads, no data sale — ever.
          </p>
        </section>

        <section className="text-center">
          <h2 className="text-3xl text-forest sm:text-4xl">Your village is one tap away.</h2>
          <Link to="/auth" className={`${btnPrimary} mt-6`}>Create your village</Link>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span>Dearkin — Build your village.</span>
          <Link to="/privacy" className="hover:text-primary hover:underline">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
