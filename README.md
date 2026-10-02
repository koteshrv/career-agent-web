<p align="center">
  <img src="public/favicon.svg" width="56" height="56" alt="" />
</p>

<h1 align="center">CareerAgent</h1>

<p align="center">
  A privacy-first job search workspace: verified postings from company ATS boards, an application pipeline, and AI-tailored LaTeX resumes generated with your own API key.
</p>

<p align="center">
  <a href="https://careeragent.fyi">careeragent.fyi</a> ·
  <a href="https://github.com/koteshrv/career-agent-extension">Browser extension</a> ·
  <a href="docs/ARCHITECTURE.md">Architecture</a> ·
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-black.svg" /></a>
  <img alt="React 19" src="https://img.shields.io/badge/React-19-black.svg" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-black.svg" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-black.svg" />
</p>

---

## Overview

CareerAgent is the web client of a two-part system. This repository is the dashboard; the [browser extension](https://github.com/koteshrv/career-agent-extension) handles form autofill, application tracking, every AI call, and local LaTeX compilation. There are no accounts and no server-side user data: profile, pipeline, resumes and API keys stay in the browser and in the extension's storage.

## Features

| Area | What you get |
|---|---|
| **Jobs** | Postings indexed directly from Greenhouse, Lever, Ashby and Workday boards. Search, country, workplace and recency filters. |
| **For you** | The same feed filtered by the search defaults in your profile, plus postings you pin by hand. Batch triage with AI scores each posting 1–5 with a verdict, matched and missing requirements. |
| **Pipeline** | Saved, applied, interviewing, offer and archived stages with follow-up reminders and a stats view. |
| **Drafts** | A tailored resume rendered into a LaTeX template and compiled inside the extension, with PDF preview, editable source, recompile, a diff against your original, and PDF/`.tex` download. Cover letters and cold emails too. Bring your own `.tex` resume to keep its layout. |
| **Profile** | Contact, experience, education, skills and search defaults, by hand or extracted from a resume PDF. Several stored resumes; one PDF is attached by autofill. |
| **Settings** | Extension pairing, theme and palette, anonymous outcome sharing, and an activity log showing every prompt sent to your AI provider. |

The extension is optional for browsing and tracking and required for anything that uses AI or touches application forms.

## Getting started

Requirements: Node.js 22 and npm.

```bash
git clone https://github.com/koteshrv/career-agent-web.git
cd career-agent-web
npm install
npm run dev -- --port 5174
```

The dev server proxies `/v1` and `/api` to the job index API. To pair an unpacked development build of the extension, paste its id into **Settings → Extension ID**, or set `VITE_EXTENSION_ID` in `.env.local`.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server with API proxy |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run lint` | oxlint |
| `npm run preview` | Serve the production build locally |

### Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | empty | Job index base URL. Empty uses the proxy in development and the production API in builds. |
| `VITE_EXTENSION_ID` | empty | Chrome Web Store id of the extension. Overridable at runtime in Settings. |

Put overrides in `.env.local`, which is ignored by git.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · react-router · SWR · self-hosted fonts · no analytics.

## Deployment

Production runs on Cloudflare Pages from `main`. `functions/` contains the Pages Functions that proxy `/v1` and `/api` to the job index API, and `public/_headers` sets the content security policy. The extension accepts messages only from `careeragent.fyi` and its subdomains, so AI features require the production domain.

## Privacy

Postings come from a public index. Profile, pipeline, drafts and resumes live in `localStorage` and the extension's `chrome.storage.local`. AI requests go from the extension straight to the provider you configured, authenticated with your own key. Optional anonymous outcome sharing reports response times by company and never includes names, resumes or notes. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full data model and security notes.

## Contributing

Issues and pull requests are welcome. Before opening a PR:

1. `npm run lint` and `npm run build` pass.
2. UI changes include a screenshot in light and dark themes.
3. Anything that crosses the extension bridge keeps the payload clamps in `src/lib/extensionBridge.ts` and the extension's `sanitize.ts` in sync.

## License

[MIT](LICENSE)
