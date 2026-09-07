# NEURAL AURORA — The Synaptic Portfolio

<div align="center">

**v2.3.0** — *A living neural network suspended in an aurora field*

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r170-000000?logo=three.js&logoColor=white)](https://threejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Immersive 3D portfolio with AI-powered gateway, neural CMD terminal, mood-based music, and full admin dashboard.

</div>

---

## Features

- **AI-Powered Gateway** — OpenRouter/OpenAI-compatible puzzle verification
- **Neural Aurora CMD** — AI terminal with full portfolio context awareness
- **Mood Swing** — Jamendo API / Web Audio synth music player
- **Neural Pattern Lock** — Memory challenge entry verification
- **YouTube Channel Stream** — Content browsing via YouTube Data API
- **Auto-Traverse Tour** — Automated site walkthrough
- **Admin Dashboard** — Full CRUD for all portfolio sections
- **Service Store** — Paid service listings with Razorpay integration
- **Support & Donations** — Razorpay-powered donation system
- **Taste-Skill Verification** — Responsive entry screen with auto-arranging grid
- **Responsive Design** — Fluid typography, spring physics, mobile-first

---

## Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10
- **Supabase** account (free tier) — [supabase.com](https://supabase.com)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your credentials

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `VITE_AI_API_BASE` | No | OpenAI-compatible API base (e.g. OpenRouter) |
| `VITE_AI_API_KEY` | No | API key for AI puzzle generation |
| `VITE_AI_MODEL` | No | Model name (default: `openai/gpt-4o-mini`) |
| `VITE_JAMENDO_CLIENT_ID` | No | Jamendo API key for mood music |
| `VITE_YOUTUBE_API_KEY` | No | YouTube Data API v3 key |
| `VITE_RAZORPAY_KEY_ID` | For payments | Razorpay client-side key |
| `RAZORPAY_KEY_ID` | For payments | Razorpay server-side key |
| `RAZORPAY_KEY_SECRET` | For payments | Razorpay server-side secret |

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Apply migrations:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   supabase db push
   ```
3. Or run `supabase-schema.sql` manually via SQL Editor

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Deployment

Deploy to **Vercel** (recommended), **Netlify**, or **Cloudflare Pages**:

- Vite is auto-detected by Vercel
- Add all environment variables in the dashboard
- SPA rewrites are configured in `vercel.json`; `/api/*` routes are excluded so Vercel serverless functions remain accessible

---

## Project Structure

```
src/
├── components/
│   ├── admin/         ← CRUD dashboard (20+ sections)
│   └── ui/            ← Reusable UI components
├── context/           ← Auth, AutoTraverse, MoodContext
├── lib/               ← Supabase client, AI gateway, hooks, music
├── data/              ← Static fallback data
└── main.jsx           ← Entry point
```

---

## Contributors

| Name | Role |
|------|------|
| **Amit Kumar (Techhackontime999)** | Founder & Lead Developer |

> For a full live list, visit the [Contributors Section](https://neural-aurora.vercel.app) on the website.
> Interested in contributing? See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT © 2026 Amit Kumar — Techhackontime999. See [LICENSE](LICENSE).
