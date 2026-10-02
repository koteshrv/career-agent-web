# CareerAgent architecture

Three repositories, one product. This page is the map; each repository's README covers its own setup.

| Repository | What it is | Runs where |
|---|---|---|
| `career-agent-web` (this) | The dashboard: Jobs, For you, Pipeline, Drafts, Profile, Settings | Browser, static site on Cloudflare Pages at careeragent.fyi |
| `career-agent-extension` | Chrome extension (WXT, Manifest V3): autofill, tracking, all AI calls, LaTeX | Browser |
| Job index API (private for now) | Postings pulled from Greenhouse, Lever, Ashby and Workday boards | api.careeragent.fyi |

Design rule: the API holds no user data and has no accounts. Everything about the user lives in their browser, split between the dashboard's `localStorage` and the extension's `chrome.storage.local`. AI calls go from the extension to the provider the user configured with their own key. Nothing is proxied through CareerAgent servers.

## How the pieces talk

```text
careeragent.fyi (React SPA)  ──externally_connectable──▶  extension service worker  ──fetch──▶  AI provider (user's key)
        │                                                        │
        │ /v1 (Cloudflare Pages Functions proxy)                 ├── chrome.storage.local (profile, pipeline, resumes, settings)
        ▼                                                        ├── offscreen document ── Web Worker ── pdfTeX (wasm)
   api.careeragent.fyi                                           └── content script on ATS pages (autofill, submit watch)
```

- The dashboard reaches the extension with `chrome.runtime.sendMessage(extensionId, …)`. The manifest's `externally_connectable.matches` limits callers to `careeragent.fyi` and subdomains (dev builds add `http://localhost/*`). The worker re-checks the sender origin against the same list, rate-limits to 30 requests a minute, and deep-clamps every payload (`src/lib/sanitize.ts`).
- The extension id is baked in at build time (`VITE_EXTENSION_ID`) and can be overridden in Settings for an unpacked dev build (`careeragent_extension_id` in `localStorage`).
- Postings come from the API through a same-origin proxy: the Vite dev server in development, `functions/` on Cloudflare Pages in production.

### Bridge actions (`src/lib/extensionBridge.ts` ↔ extension `src/lib/bridge.ts`)

| Action | Purpose |
|---|---|
| `ping`, `get_state` | Reachability; profile + pipeline snapshot for hydration |
| `save_profile`, `upsert_application`, `delete_application` | Per-record sync, extension is canonical |
| `parse_resume`, `parse_resume_for_filters` | Resume PDF → profile and search defaults (`intake`-style extraction) |
| `list_resumes`, `add_resume`, `get_resume`, `delete_resume`, `set_upload_resume`, `save_resume`, `get_resume_meta` | Several stored resumes; one PDF flagged for form uploads; `.tex/.md/.txt` as drafting bases |
| `generate_material` | Tailored resume (LaTeX body → compiled PDF), cover letter, cold email |
| `compile_latex` | Recompile edited LaTeX |
| `evaluate_jobs` | Triage up to 15 postings per call: score, verdict, reason, matches, gaps |

Every AI-backed action returns `meta` with provider, model, duration and the exact system prompt, which the dashboard writes to Settings → AI activity.

## Sync model

The extension's storage is canonical for the profile and the pipeline. The dashboard keeps a `localStorage` cache, pushes per-record changes as they happen, and on load and on tab focus runs `hydrateFromExtension()`: last-writer-wins on `updatedAt`, with delete tombstones so a deletion on one side is not resurrected by the other. Pages re-read on the `careeragent_sync` event.

## Dashboard storage keys

| Key | Holds |
|---|---|
| `careeragent_candidate_profile` | Profile cache |
| `careeragent_tracked_applications`, `careeragent_deleted_application_ids` | Pipeline cache and tombstones |
| `careeragent_global_filters` | Search defaults: roles, keywords, excludes, location |
| `careeragent_evaluations` | AI triage results by posting id |
| `careeragent_foryou_pins` | Postings pinned to For you by hand |
| `careeragent_drafts` | Last 24 drafts: text, PDF (base64), change list, per posting and kind |
| `careeragent_api_logs` (session) | AI activity log |
| `careeragent-theme`, `careeragent-palette`, `careeragent_extension_id`, `careeragent_api_url`, `careeragent_onboarded`, `careeragent_telemetry` | Preferences |

Extension keys: `careeragent_profile`, `careeragent_applications`, `careeragent_resumes` (+ `careeragent_resume` mirror of the upload PDF), `careeragent_settings`, `careeragent_answers`, `careeragent_theme`, `careeragent_synced_profile`.

## Jobs and For you

- **Jobs** (`/jobs`) is the raw feed with the user's own search, country, workplace and recency filters.
- **For you** (`/matches`) runs the same feed with the profile's search defaults as the query and excluded terms filtered out client-side (the API has no negation), merged with hand-pinned postings. It shows nothing until search defaults exist.
- **Evaluate** sends postings ten at a time to `evaluate_jobs`, fetching full descriptions by id where the list only carries a summary. Results persist and sort the list; the reading pane shows the verdict card. The status line reports scored, skipped and failed counts honestly.

## Drafting pipeline

1. The dashboard sends the posting plus a chosen base resume id to `generate_material`.
2. The extension composes the prompt the way `career-agent/backend/routers/playbooks.py` does: a vendored career-ops playbook (`prompts/latex.md`, `cover.md`, `email.md`) as the system prompt, then `# TARGET JOB DETAILS` and `# CANDIDATE CONTEXT` (profile brief, plus the base resume's text when one is chosen). Replies are strict JSON per the playbook's `[OUTPUT SCHEMA]`.
3. For a resume, `latex.md`'s JSON (summary, experience bullets, skills, changes) is rendered by code into the fixed LaTeX template (`src/lib/latex/template.ts`, `render.ts`) with every string escaped. Dates and education come from the profile. The model never writes LaTeX. The exception is a user's own `.tex` base, which is rewritten in place and sanitised.
4. The document is compiled inside the extension (next section) and the dashboard receives source, PDF and the change list. The Drafts page previews the PDF, lets the user edit the source and recompile, diff against the base or the profile facts (`src/lib/resumeDiff.ts`), download PDF or `.tex`, and mark the PDF as the one autofill uploads. Drafts persist per posting.

## LaTeX inside the extension

- Engine: SwiftLaTeX's pdfTeX compiled to WebAssembly (`public/latex`, EPL-2.0), vendored with a two-line patch so files cache under their real names without server headers.
- It runs in a Web Worker, which a service worker cannot spawn, so the worker opens a `chrome.offscreen` document on demand (`entrypoints/offscreen`, `src/lib/latex/compile.ts`) and messages it `COMPILE_LATEX`.
- TeX Live is a static bundle served by the extension itself (`public/texlive`, about 52 MB): the kernel and the template's packages, Computer Modern Type 1, a cm-super subset for T1/TS1, AMS, marvosym, Font Awesome 5, and the font packages lato, sourcesanspro, raleway, charter, helvet and times. The format file was dumped by this engine from this kernel. The manifest grants `offscreen` and `'wasm-unsafe-eval'`. A document that needs anything else fails with a "File X not found" line, which the dashboard explains above the raw log.
- Regeneration: a kpsewhich-backed on-demand server records every file a compile fetches, so the bundle is the exact closure of the test documents (see `public/texlive/README.md`).

## Security notes

- Posting text is untrusted. Prompts quote it as data, the override header forbids tool use, and the dashboard renders descriptions through react-markdown without raw HTML.
- The dashboard's CSP (`public/_headers`) allows scripts from self only, fonts self-hosted, and `blob:` frames for the PDF preview.
- The extension's CSP allows `'wasm-unsafe-eval'` for pdfTeX and `connect-src` to the API, the four AI providers and itself.
- No secrets ship in either repository; keys are typed into the extension and stay in `chrome.storage.local`.

## Verification used during development

Headless Playwright scripts seed `localStorage` and screenshot every route in light and dark; a shim serves the built popup with a fake `chrome` API; the built offscreen page is driven the same way to compile sample documents through the bundled engine. Extension unit tests (`npm test`) cover the bridge, sanitisers, autofill, LaTeX sanitising and the playbook composition and renderer.
