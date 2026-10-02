# CareerAgent

A job search workspace that runs in your browser. Verified postings pulled straight from company ATS boards, a pipeline to track what you applied to, and AI drafts (LaTeX resume, cover letter, cold email) written with your own API key through the companion extension. No account, no server-side profile: your data lives in your browser and in the extension.

Live at [careeragent.fyi](https://careeragent.fyi). Extension: [career-agent-extension](https://github.com/koteshrv/career-agent-extension). Job index API: [career-agent-api](https://github.com/koteshrv/career-agent-api).

## What it does

- **Jobs** – search postings indexed directly from Greenhouse, Lever, Ashby and Workday boards, with country, workplace and recency filters, your search defaults applied, and a reading pane that shows which of your skills the posting asks for.
- **Pipeline** – saved, applied, interviewing, offer and archived columns, follow-up reminders three days after applying, and a stats view.
- **Drafts** – a tailored resume typeset as LaTeX inside the extension (preview, edit the source, recompile, download PDF or .tex), plus cover letters and cold emails. Bring your own `.tex` resume and the AI rewrites its content while keeping your layout.
- **Profile** – contact details, experience, education, skills and search defaults, filled by hand or extracted from a resume PDF by the extension's AI. Store several resumes; one PDF is attached by autofill, text ones serve as drafting bases.
- **Settings** – extension pairing, theme and palette, anonymous outcome sharing, the AI activity log.

The extension is optional for browsing and tracking. It is required for anything that uses AI or touches application forms, and it talks to this app only over Chrome's `externally_connectable` channel from `careeragent.fyi`.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, react-router, SWR. Fonts self-hosted. No analytics.

## Develop

```bash
npm install
npm run dev -- --port 5174
```

The dev server proxies `/v1` and `/api` to `https://api.careeragent.fyi`. To pair an unpacked development build of the extension, paste its id into Settings → Extension ID, or set `VITE_EXTENSION_ID` in `.env.local`.

```bash
npm run lint    # oxlint
npm run build   # tsc + vite
```

## Deploy

Production runs on Cloudflare Pages at [careeragent.fyi](https://careeragent.fyi), built with `npm run build` from `main`. `functions/` holds the Pages Functions that proxy `/v1` and `/api` to the job index API so the browser never calls it cross-origin, and `public/_headers` sets the content security policy. The extension only accepts messages from `careeragent.fyi` and its subdomains.

## Privacy

Postings come from the public API. Profile, pipeline and resumes stay in `localStorage` and the extension's storage. AI calls go from the extension to the provider you configured with your key. Optional anonymous outcome sharing sends response times by company, never names, resumes or notes.

## License

MIT
