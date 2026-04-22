# Dearkin — Project Context for Claude Code

## What This Is
Dearkin is a financial planning platform for working parents. dearkin.com. Entity: Dearkin LLC (WY). Founder: Sneha.

The core product is an 8-pillar Financial OS that guides working parents through the most financially complex 18 months of their lives — from pregnancy through return to work. The MLP is a Washington State PFML calculator with employer top-up data, STD stacking, and a week-by-week income timeline behind a $49 Stripe paywall.

## Development Approach
- All building is done via Claude Code (no Bolt.new, no v0 scaffolding)
- Claude Code handles all scaffolding, logic, UI components, API routes, tests, and integrations
- UI components are built directly in Claude Code using Tailwind CSS
- GitHub repo: https://github.com/snehatiwari029/DearkinV2

## Stack
- **Framework:** Next.js 14 App Router
- **Language:** TypeScript (all .ts / .tsx files — no plain .js in app/)
- **Styling:** Tailwind CSS (all brand tokens in tailwind.config.ts)
- **Database:** Supabase (Postgres + future auth)
- **Payments:** Stripe (hosted checkout, one-time payments)
- **Email:** Resend (transactional, react-email templates)
- **Hosting:** Vercel (auto-deploy on git push to main)
- **Analytics:** Plausible (privacy-first, custom events)
- **Testing:** Vitest (run: npx vitest — must pass before every deploy)

## Brand Tokens (defined in tailwind.config.ts)
```
terracotta: { DEFAULT: '#C1694F', light: '#F5E6E0', dark: '#9A4A35' }
cream:      { DEFAULT: '#F0EBE3', dark: '#E8E0D6' }
ink:        { DEFAULT: '#2D2D2D', mid: '#6B6B6B', light: '#9A9A9A' }
sage:       { DEFAULT: '#4A7C6F', light: '#E0EDEB', dark: '#2D5A50' }
parchment:  '#FAF8F4'
```
- **Serif font:** DM Serif Display — use for hero numbers, large headings, result figures
- **Sans font:** Plus Jakarta Sans — use for all body text, labels, inputs, navigation
- Flat fills, 1px borders, 8px border-radius on inputs, 12px on cards
- No drop shadows. No gradients. Terracotta for primary actions. Sage for success/confirmation.

## Repo Structure
```
app/                    → Next.js App Router pages
app/api/                → API routes (checkout, stripe-webhook, capture, generate-pdf)
app/calculator/         → WA calculator page + components
app/calculator/ca/      → CA calculator (Phase 2)
app/calculator/ny/      → NY calculator (Phase 2)
app/tools/              → Return-to-Work and future tools (Phase 3)
components/layout/      → Nav, Footer
components/ui/          → Button, Input, reusable components
lib/pfml/               → Calculation engines and rate tables
lib/rtw/                → Return-to-work calculation engine
lib/pdf/                → PDF generation components
supabase/               → Migrations
```

## Stripe Products (set up in dashboard, use env vars)
| Product | Price | Env Var |
|---|---|---|
| Leave Intelligence WA | $49.00 | STRIPE_PRICE_LEAVE_INTEL |
| Family Finance Planner | $29.00 | STRIPE_PRICE_FAMILY_FINANCE |
| Return-to-Work | $29.00 | STRIPE_PRICE_RTW |
| Benefits Navigator | $19.00 | STRIPE_PRICE_BENEFITS_NAV |
| Dearkin Complete | $99.00 | STRIPE_PRICE_COMPLETE |

## WA PFML Formula (2026)
```
SAWW = 1830  |  MAX_BENEFIT = 1647  |  MIN_BENEFIT = 100
AWW = annualSalary / 52

If AWW <= SAWW / 2:   weeklyBenefit = AWW * 0.90
If AWW > SAWW / 2:    weeklyBenefit = (SAWW/2 * 0.90) + (AWW - SAWW/2) * 0.50

Claim year = year of Sunday preceding leave start date
Clamp result: MIN_BENEFIT to MAX_BENEFIT
Exception: if AWW < MIN_BENEFIT/week, return AWW (full wage, not floor)
```

## WA Leave Duration Rules
| Leave Type | Max Weeks | Waiting Week |
|---|---|---|
| Medical (pregnancy) | 12 weeks | WAIVED |
| Medical + complications | 14 weeks | WAIVED |
| Family / Bonding | 12 weeks | WAIVED |
| Combined (medical + bonding) | 16 weeks HARD CAP | WAIVED |
| Combined + complications | 18 weeks HARD CAP | WAIVED |
| Non-pregnancy medical | 12 weeks | APPLIES (7 days) |

## MNC Employer Database (WA)
| Employer | Top-up Weeks | Top-up % | STD Weeks |
|---|---|---|---|
| Amazon | 20 | 100% | 6 |
| Microsoft | 20 | 100% | 6 |
| Boeing | 8 | 100% | 6 |
| Starbucks | 18 | 100% | 6 |
| Meta | 20 | 100% | 8 |
| Google | 18 | 100% | 6 |
| Costco | 8 | 60% | 6 |
| Expedia | 20 | 100% | 6 |
| Zillow | 16 | 100% | 6 |
| Nordstrom | 8 | 100% | 6 |
| T-Mobile | 12 | 100% | 6 |
| Other / None | 0 | 0% | 0 |

## Supabase Tables
```sql
email_captures: id, email, state, employer, salary_band, leave_type, weekly_benefit, has_gap, created_at
purchases: id, email, product, amount_cents, stripe_session_id, state, unlocked_at
```
**CRITICAL: Never store exact salary. Always use salary_band string.**

## Key Rules
- Never store exact salary — use salary_band string in Supabase
- Paywall: cookie 'dearkin_access' = JWT with { product, email, sessionId, exp: +30days }. Set by stripe-webhook handler.
- All Stripe webhooks must respond 200 within 3 seconds
- Run `npx vitest` before every deploy — all 15 unit tests must pass
- All amounts in cents in Stripe, dollars in UI
- Income gap section shown ONLY when totalIncomeGap > 0
- If totalIncomeGap = 0: show sage callout '✓ No income gap' — do NOT show gap section
- Always show employer policy disclaimer: 'Policies change — verify with HR'
- All calculator results: 'Not legal or financial advice' disclaimer required

## Analytics Events (Plausible)
| Event | Trigger |
|---|---|
| calculator_completed | Form submits and results render |
| gap_viewed | IncomeGapBanner renders (gap > 0) |
| email_captured | Email capture form submitted |
| upgrade_clicked | Paywall CTA clicked |
| purchase_completed | Stripe success webhook fires |
| pdf_downloaded | PDF download button clicked |

## 15 Unit Tests — All Must Pass
| # | Salary | Expected Weekly Benefit |
|---|---|---|
| T01 | $60K | $942.93 |
| T02 | $47,580 (threshold) | $823.50 |
| T03 | $120K | $1,519.85 |
| T04 | $180K | $1,647.00 (capped) |
| T05 | $250K | $1,647.00 (capped) |
| T06 | $4K (sub-floor) | $76.92 (full wage) |
| T07 | $6K | $103.85 |
| T08 | $120K 2025 rates | $1,496.65 |
| T09 | Both, no complications | 16 weeks total |
| T10 | Both, with complications | 18 weeks total |
| T11 | Bonding only | 12 weeks, no waiting week |
| T12 | Amazon $120K | Gap = 0 weeks 1-20 |
| T13 | No top-up $120K | Gap $787.84/week |
| T14 | STD stacking $120K | Weeks 1-6 gap = $0 |
| T15 | 819 vs 820 hours | 819 = ineligible, 820 = eligible |

## Environment Variables Required
```
# Phase 0
NEXT_PUBLIC_SITE_URL=https://dearkin.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=dearkin.com

# Phase 1
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_LEAVE_INTEL=
STRIPE_PRICE_FAMILY_FINANCE=
STRIPE_PRICE_RTW=
STRIPE_PRICE_BENEFITS_NAV=
STRIPE_PRICE_COMPLETE=

# Phase 1b
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@dearkin.com
NEXTAUTH_SECRET=
```

## Phase Status
| Phase | Description | Status |
|---|---|---|
| Phase 0 | Foundation — repo scaffold, homepage, brand tokens | 🔜 Next |
| Phase 1 | WA PFML Calculator + Stripe paywall ($49) | Planned |
| Phase 1b | Email capture, PDF export, analytics, gap banner | Planned |
| Phase 2 | CA + NY calculators, multi-state routing | Planned |
| Phase 3 | Return-to-Work Economics module ($29 add-on) | Planned |
