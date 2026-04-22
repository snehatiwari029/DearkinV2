import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function Nav() {
  return (
    <header className="bg-parchment border-b border-cream-dark sticky top-0 z-50">
      <div className="container-page flex items-center justify-between h-16">
        <Link href="/" className="font-serif text-xl text-ink tracking-tight">
          Dearkin
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/calculator"
            className="text-sm font-medium text-ink-mid hover:text-ink transition-colors"
          >
            WA Calculator
          </Link>
          <Link
            href="/#waitlist"
            className="text-sm font-medium text-ink-mid hover:text-ink transition-colors"
          >
            Waitlist
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/calculator">
            <Button size="sm">Try Calculator</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
