export default function CalculatorPage() {
  return (
    <section className="py-20">
      <div className="container-page">
        <div className="max-w-xl">
          <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3">
            Washington State
          </p>
          <h1 className="font-serif text-4xl text-ink mb-4">
            PFML Leave Calculator
          </h1>
          <p className="text-ink-mid text-lg mb-8">
            Enter your details to see your week-by-week income during leave.
            Employer top-up, STD stacking, and income gap analysis included.
          </p>
          <div className="bg-cream rounded-card border border-cream-dark p-8 text-center">
            <p className="text-ink-mid">
              Calculator coming in Phase 1. Join the waitlist on the{' '}
              <a href="/#waitlist" className="text-terracotta underline">
                homepage
              </a>{' '}
              to be notified.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
