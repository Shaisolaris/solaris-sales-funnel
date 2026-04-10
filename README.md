# Solaris — 3-Step Checkout Funnel

A clean, modern multi-step sales funnel built from scratch in Next.js 15 + Tailwind CSS. Three steps: plan selection → customer info → payment → success. Designed to drop-in anywhere a SaaS, course, or service business needs a friction-light checkout.

**Live demo:** https://shaisolaris.github.io/solaris-sales-funnel/

## What it shows off

- **Progressive disclosure** — only asks for what's needed at each step, with clear "back" navigation
- **Visual progress indicator** — customers always know where they are and what's left
- **Real form validation** — email regex, required field checks, card-number sanity checks, disabled "continue" buttons until valid
- **Persistent order summary** — the selected plan + totals stay visible through steps 2 and 3
- **Stripe test-mode ready** — pre-filled with `4242 4242 4242 4242` so you can click through end-to-end
- **Responsive** — mobile-first layout, looks great at every width
- **Accessible** — proper `<label>`s, `aria-current` on step indicator, keyboard-friendly buttons

## Stack

- Next.js 15 (App Router, `output: "export"` for static hosting)
- React 19
- Tailwind CSS 3
- TypeScript

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Wire up real Stripe (test mode)

The funnel ships with a mock payment flow so it deploys to GitHub Pages with zero config. To take actual test-mode payments:

### Option A — Stripe Payment Links (easiest, no backend)

1. Log into https://dashboard.stripe.com/test/payment-links
2. Create a Payment Link for each plan (Starter / Growth / Enterprise)
3. In `src/app/page.tsx`, paste the URL into each plan's `stripePaymentLink` field
4. That's it. The pay button will redirect directly to Stripe's hosted checkout.

### Option B — Checkout Sessions (full control, needs a backend)

1. Deploy this project to Vercel instead of GitHub Pages (remove `output: "export"` from `next.config.ts`)
2. Add an API route `src/app/api/checkout/route.ts` that calls `stripe.checkout.sessions.create(...)`
3. Replace the mock `handleSubmitPayment` with a POST to that route, then redirect to `session.url`
4. Add a success route that uses Stripe's webhook to confirm the payment

## Deployment

This repo auto-deploys to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`. The Tailwind build runs at `npm run build` and emits a static `out/` directory.
