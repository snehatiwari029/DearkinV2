import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Dearkin" },
      { name: "description", content: "How Dearkin keeps your family's care plans private. Share care, not whereabouts." },
      { property: "og:title", content: "Privacy — Dearkin" },
      { property: "og:description", content: "How Dearkin keeps your family's care plans private." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl space-y-5 px-5 py-12">
        <Link to="/" className="font-serif text-2xl text-primary">Dearkin</Link>
        <h1 className="text-4xl text-forest">Share care, not whereabouts.</h1>
        <p className="text-muted-foreground">Dearkin stores only what's needed to coordinate care: your village, the people you invite, and care blocks made of a day, hours, who's assigned and their status.</p>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Villages are invite-only and can't be searched or discovered.</li>
          <li>Caregivers see only the blocks assigned to them.</li>
          <li>No location tracking, no care notes, no photos, no ads, no data sale.</li>
          <li>Parent admins can export or delete all village data at any time.</li>
        </ul>
      </main>
    </div>
  );
}
