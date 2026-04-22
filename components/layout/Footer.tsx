import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-cream-dark py-10">
      <div className="container-page">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-serif text-lg text-ink mb-1">Dearkin</p>
            <p className="text-sm text-ink-light max-w-xs">
              Financial planning for working parents — from pregnancy through
              return to work.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-xs font-semibold text-ink uppercase tracking-widest mb-3">
                Tools
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/calculator"
                    className="text-sm text-ink-mid hover:text-ink transition-colors"
                  >
                    WA PFML Calculator
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-ink uppercase tracking-widest mb-3">
                Company
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/#waitlist"
                    className="text-sm text-ink-mid hover:text-ink transition-colors"
                  >
                    Join Waitlist
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream-dark flex flex-col md:flex-row justify-between gap-2">
          <p className="text-xs text-ink-light">
            &copy; {new Date().getFullYear()} Dearkin LLC. All rights reserved.
          </p>
          <p className="text-xs text-ink-light">
            Not legal or financial advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
