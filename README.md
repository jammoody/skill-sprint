# Skill Sprint — Expanded MVP (Free, no Stripe)

A Vercel-ready Next.js app with:
- Onboarding skill test (profile)
- Daily adaptive sprint powered by OpenAI (serverless API)
- Local persistence (localStorage): profile, progress, streak
- Simple dashboard
- No payments required (Stripe can be added later)

## One-time setup
1) Ensure you have **Node 18+** installed.
2) Create `.env.local` in the project root with your OpenAI key:

```
OPENAI_API_KEY=sk-your-key-here
```

## Run locally
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Deploy to Vercel
1) Push this folder to a GitHub repo.
2) Import it in Vercel.
3) In Vercel → Project Settings → Environment Variables, add:
   - `OPENAI_API_KEY`

Deploy. That’s it.

## Where things live
- `/pages/onboarding.js` — skill test that stores a profile
- `/pages/sprint.js` — calls `/api/generate-sprint` to create a daily sprint
- `/pages/dashboard.js` — shows profile, streak, and progress
- `/lib/storage.js` — localStorage helpers
- `/pages/api/generate-sprint.js` — calls OpenAI with profile + recent history

## Add Stripe later
- Add Stripe keys as env vars
- Create `/api/create-checkout-session` and a paywall
- Gate `/sprint` for non-subscribers

## Add Supabase later
- Replace `localStorage` with Supabase tables for users, sprints, progress
- Add Auth (Supabase Auth / Clerk) to sync across devices

## Safety & costs
- OpenAI usage is pay-as-you-go. The prompt is short and responses are small to keep costs low.
- Consider adding basic rate limiting on `/api/generate-sprint` if you make it public.

Enjoy!
