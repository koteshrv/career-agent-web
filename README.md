# CareerAgent Web

The web interface for **[CareerAgent](https://github.com/koteshrv/career-agent)**, providing verified job aggregation and indexing directly from enterprise Applicant Tracking Systems (ATS). Deployed at [jobs.careeragent.fyi](https://jobs.careeragent.fyi).

---

## Overview

CareerAgent Web is a responsive web client designed for real-time discovery of career opportunities. Postings are ingested directly from company career portals (Greenhouse, Lever, Ashby, Workday, and others) without intermediary job board scraping, ensuring active requisition status.

## Key Capabilities

- **Direct ATS Sourcing**: Index open requisitions harvested directly from primary employer boards (Greenhouse, Lever, Ashby, Workday).
- **Search & Filtering**: Query across job titles, organizations, and technical keywords.
- **Employer Directory**: Directory of monitored organizations with active open role counts.
- **Requisition Verification**: Direct reporting mechanism to flag inactive or invalid job listings.

## Tech Stack

- **UI Framework**: React 18 with TypeScript
- **Tooling & Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Data Ingestion**: SWR (Stale-While-Revalidate)
- **Icons**: Lucide React
- **Hosting**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, pnpm, or yarn

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/koteshrv/career-agent-web.git
   cd career-agent-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5174`.

> In local development, Vite proxies requests from `/v1` and `/api` to the backend API (`https://api.careeragent.fyi`) to avoid CORS restrictions.

### Building for Production

Compile an optimized production build:

```bash
npm run build
```

Build artifacts are emitted to the `dist/` directory.

## Deployment

The application is deployed as a static site on Cloudflare Pages.

### Cloudflare Pages Configuration

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Root Directory**: `/`

Production API requests communicate with `https://api.careeragent.fyi`.

## Related Repositories

- [CareerAgent Core](https://github.com/koteshrv/career-agent) — ATS scrapers, data pipelines, and orchestration backend.

## License

MIT License. See [LICENSE](LICENSE) for details.
