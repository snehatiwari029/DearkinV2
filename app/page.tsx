import Link from 'next/link'
import Button from '@/components/ui/Button'
import WaitlistForm from '@/components/ui/WaitlistForm'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-20 border-b border-cream-dark">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-ink-mid text-sm font-medium uppercase tracking-widest mb-4">
              Financial Planning for Working Parents
            </p>
            <h1 className="font-serif text-5xl leading-tight text-ink mb-6">
              Know your numbers
              <br />
              before your leave.
            </h1>
            <p className="text-ink-mid text-lg leading-relaxed mb-8 max-w-xl">
              The most financially complex 18 months of your life deserve more
              than a guess. Dearkin gives you a week-by-week income plan built
              on your actual salary, employer policy, and state benefits.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/calculator">
                <Button size="lg">Calculate My WA Leave</Button>
              </Link>
              <a href="#waitlist">
                <Button variant="outline" size="lg">Join Waitlist</Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-light">
              Washington State · Free preview · No account required
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 bg-parchment border-b border-cream-dark">
        <div className="container-page">
          <h2 className="font-serif text-3xl text-ink mb-4">
            Leave planning is broken.
          </h2>
          <p className="text-ink-mid text-lg mb-12 max-w-xl">
            Most parents piece together their plan from HR PDFs, Reddit threads,
            and best guesses — weeks before delivery.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                stat: '60%',
                label: 'of parents underestimate their income gap by $2,000+',
              },
              {
                stat: '3 wks',
                label: 'average time to understand leave entitlements',
              },
              {
                stat: '$8,400',
                label: 'median income lost during leave at median WA salary',
              },
            ].map(({ stat, label }) => (
              <div
                key={stat}
                className="bg-cream rounded-card p-6 border border-cream-dark"
              >
                <p className="font-serif text-4xl text-terracotta mb-2">{stat}</p>
                <p className="text-ink-mid text-sm leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="py-20 bg-cream border-b border-cream-dark">
        <div className="container-page">
          <div className="max-w-xl mb-12">
            <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3">
              The Financial OS
            </p>
            <h2 className="font-serif text-3xl text-ink mb-4">
              8 pillars. One plan.
            </h2>
            <p className="text-ink-mid">
              Dearkin walks you through every financial decision from pregnancy
              through return to work — starting with your WA state benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: '01', label: 'WA PFML Calculator', available: true },
              { num: '02', label: 'Employer Top-Up Analysis', available: true },
              { num: '03', label: 'STD / LTD Stacking', available: true },
              { num: '04', label: 'Week-by-Week Timeline', available: true },
              { num: '05', label: 'CA + NY Leave', available: false },
              { num: '06', label: 'Return-to-Work Economics', available: false },
              { num: '07', label: 'Childcare Cost Modeling', available: false },
              { num: '08', label: 'Family Finance Planner', available: false },
            ].map(({ num, label, available }) => (
              <div
                key={num}
                className={`rounded-card p-5 border ${
                  available
                    ? 'bg-parchment border-cream-dark'
                    : 'bg-cream border-cream-dark opacity-50'
                }`}
              >
                <p className="font-serif text-2xl text-terracotta mb-2">{num}</p>
                <p className="text-ink text-sm font-medium">{label}</p>
                {available && (
                  <span className="inline-block mt-2 text-xs text-sage font-semibold">
                    Available now
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="py-20 bg-parchment">
        <div className="container-page">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="font-serif text-3xl text-ink mb-4">
              Be first to know.
            </h2>
            <p className="text-ink-mid mb-8">
              We're launching the WA PFML calculator and full Financial OS.
              Join the waitlist to get early access and founding-member pricing.
            </p>
            <WaitlistForm />
            <p className="mt-4 text-xs text-ink-light">
              No spam. Unsubscribe any time.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
