# CareerAgent Web ⚡

> Modern, lightweight, open-source job search web interface powered by crowdsourced ATS scraping from [CareerAgent](https://github.com/koteshrv/career-agent).

[![Live Site](https://img.shields.io/badge/Live-jobs.careeragent.fyi-orange?style=flat-square)](https://jobs.careeragent.fyi)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 🌐 Live Demo

Visit the public job discovery engine: **[jobs.careeragent.fyi](https://jobs.careeragent.fyi)**

---

## ✨ Features

- **⚡ Direct ATS Aggregation**: Discover open roles collected directly from company career pages across Greenhouse, Lever, Ashby, Workday, and more.
- **🔍 Instant Search**: Search by job title, company name, or technology stack with fluid debounced queries.
- **🏢 Company Directory**: Browse hiring companies in a clean responsive grid displaying real-time job counts and high-resolution logos.
- **🚩 Community Flagging**: Built-in modal to report expired, dead links or spam roles directly to moderators.
- **🌗 Dark & Light Modes**: Seamless dark and light themes with automatic system preference detection.
- **🚀 Cloudflare Pages Ready**: Zero-configuration static deployment with unlimited bandwidth and global edge caching.

---

## 🛠 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Fetching & Cache**: [SWR](https://swr.vercel.app/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Google Sans
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or pnpm / yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/koteshrv/career-agent-web.git
   cd career-agent-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5174](http://localhost:5174) in your browser.

> In development mode, Vite automatically proxies `/v1` and `/api` requests to `https://api.careeragent.fyi` to bypass CORS.

### Building for Production

```bash
npm run build
```

This generates an optimized static build in the `dist/` directory ready to be deployed to any static host or CDN.

---

## ☁️ Deployment (Cloudflare Pages)

This application is designed to be deployed as a static site on **Cloudflare Pages**:

1. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select `career-agent-web`.
3. Configure the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Deploy!

---

## 🔗 Related Projects

- **[CareerAgent Core](https://github.com/koteshrv/career-agent)** — The automated ATS scraping engine, AI job evaluator, and background task orchestrator.

---

## 📄 License

MIT © [Hari](https://github.com/koteshrv)
