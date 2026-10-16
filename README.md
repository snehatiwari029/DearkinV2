# DearkinV2
# Dearkin — Privacy-First Childcare OS

**Build your village with confidence.**

Dearkin is a privacy-first childcare organizer for parents and nannies. It helps
parents coordinate childcare — caregivers, schedules, and kids' information —
while keeping sensitive family data private and under the parent's control.

🌐 Live site: https://dearkin.com

## Why privacy-first

Sharing kids' information with caregivers is necessary — but parents should
control exactly what each caregiver sees. Dearkin is designed around that
principle: role-based views (parents vs. caregivers), minimal data exposure,
and no selling of family data.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — Postgres, Auth, and Row Level Security for privacy-by-design
  data access
- Deployed to a custom domain (dearkin.com)

## Project structure

- `app/` — Next.js routes and pages
- `components/` — UI components
- `lib/` — shared utilities and Supabase client
- `supabase/migrations/` — database schema and RLS policies

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm run dev

## How it was built

Dearkin was built with AI-assisted development (Lovable, Claude, Cursor) —
directing AI coding tools to implement the product, with human review and
testing throughout. It started from a PRFAQ and full product spec before any
code was written.

## Status

Personal project, live at https://dearkin.com. Actively evolving.

