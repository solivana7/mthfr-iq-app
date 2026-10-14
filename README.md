# MTHFR IQ

**Live:** https://mthfriq.natashaberness.com

Interactive MTHFR assessment, education & recommendation app by Natasha Berness.

5 phases:
1. **Quiz** — 10 symptom + history questions
2. **DNA Upload** (optional) — 23andMe / Ancestry / lab PDF analyzed by Claude
3. **Gamified Education** — 5 unlockable levels, 15 micro-lessons
4. **Personalized Report** — Claude generates a tailored protocol, emailed via Resend
5. **Conversion** — Fullscript supplements · GHL booking · Amazon book link

## Engineering highlights

- **Dual rate limiters** — a generous global limiter (200 req / 15 min) plus a tight 10-requests-per-hour cap on the AI-billed endpoints (DNA analysis + report generation), so Claude spend is bounded even under abuse.
- **In-memory-only DNA processing** — uploaded 23andMe / Ancestry / lab files are parsed from a memory buffer (`multer.memoryStorage()`) and never written to disk.
- **25 MB upload cap** enforced at the multipart layer before any bytes reach the AI pipeline.
- **Deterministic protocol router, separated from the LLM** — quiz answers + DNA signals are scored by a pure client-side function (`client/src/lib/protocolRouter.js`) that picks the supplement tier (starter / complete / detox) before Claude ever sees the request, so the LLM only writes prose, never makes protocol decisions.
- **Accessibility touches** — ARIA radiogroup / checkbox / tablist semantics on the quiz and protocol picker, `aria-required` on form inputs, `role="alert"` on validation errors, decorative emoji hidden from screen readers.

## Stack

- **Client** — React 18 + Vite + Tailwind CSS
- **Server** — Node.js + Express, serves the built client and the API
- **AI** — Anthropic Claude (`@anthropic-ai/sdk`)
- **Email** — Resend
- **CRM push** — Make.com webhook → GHL
- **Deploy** — Railway (Nixpacks builder)

## Local development

```bash
# install everything
npm run install:all

# copy and fill in env vars
cp .env.example .env
# edit .env

# run the API on :8080
npm run dev:server

# in another terminal, run the Vite dev server on :5173
npm run dev:client
```

The Vite dev server proxies `/api/*` to `http://localhost:8080`, so you only ever
need to open `http://localhost:5173`.

## Environment variables

| Var | What it's for |
|-----|---------------|
| `ANTHROPIC_API_KEY` | Claude API — DNA analysis + report generation. Get from https://console.anthropic.com |
| `RESEND_API_KEY` | Email delivery. Get from https://resend.com/api-keys |
| `MAKE_WEBHOOK_URL` | Make.com scenario URL that pushes the lead into GHL |
| `GHL_CALENDAR_LINK` | Natasha's GHL booking widget URL |
| `FULLSCRIPT_LINK` | Fullscript dispensary link |
| `PORT` | Server port (Railway sets automatically) |
| `CLIENT_ORIGIN` | CORS origin (use `*` if serving the client from the same origin) |
| `CLAUDE_MODEL` | Optional override. Defaults to `claude-sonnet-4-20250514`. Update to a current model ID if needed. |

## Deploy to Railway in 3 steps

1. Push this repo to GitHub.
2. In Railway → **New Project** → **Deploy from GitHub repo** → select this repo.
3. Add the env vars from `.env.example` in the Railway service settings, then deploy.

Railway will run the build defined in `railway.json` (installs root, client, server,
builds the Vite client) and start the Express server, which serves the built client
from `/client/dist` and the API at `/api/*`.

## Embed on natashaberness.com

Two options:

**Subdomain (recommended)** — point `mthfriq.natashaberness.com` at the Railway
service, then link to it directly from natashaberness.com.

**iframe** —

```html
<iframe
  src="https://mthfriq.natashaberness.com"
  style="width:100%; height:900px; border:0;"
  loading="lazy"
></iframe>
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/analyze-dna` | Multipart upload, returns Claude variant analysis JSON |
| `POST` | `/api/generate-report` | JSON `{quizAnswers, dnaAnalysis, firstName}`, returns HTML report |
| `POST` | `/api/send-email` | JSON `{firstName, email, reportHtml}`, sends via Resend |
| `POST` | `/api/push-to-make` | Forwards lead payload to Make.com webhook |
| `GET` | `/api/config` | Public config (Fullscript / calendar / book links) |
| `GET` | `/api/health` | Health check |

## Compliance

Every screen with health content displays:
> This tool is for educational purposes only and is not a medical diagnosis. Always consult your healthcare provider.

Uploaded DNA files are processed in memory only and never written to disk.

## File structure

```
mthfr-iq/
├── client/                      Vite + React + Tailwind
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/          7 stage components
│       └── data/                quizData.js, educationData.js
├── server/                      Express API + static host
│   ├── index.js
│   └── package.json
├── .env.example
├── .gitignore
├── railway.json
├── package.json                 root scripts
└── README.md
```

---

Portfolio — code shared for review, not licensed for reuse.
