#!/usr/bin/env node
// Downloads a logo for every company in scripts/company-domains.json into public/logos/<slug>.png (128x128, transparent
// padding) and writes src/data/logos.json mapping lowercase company name -> file. Self-hosting keeps logos crisp and
// stops every logo view from telling a third party which companies a visitor browses.
// Usage: node scripts/fetch-logos.mjs [--force]   Needs ImageMagick (`convert`, `identify`).
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const domains = JSON.parse(readFileSync(join(ROOT, 'scripts/company-domains.json'), 'utf8'));
const OUT = join(ROOT, 'public/logos');
const MANIFEST = join(ROOT, 'src/data/logos.json');
const force = process.argv.includes('--force');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
mkdirSync(OUT, { recursive: true });
mkdirSync(join(ROOT, 'src/data'), { recursive: true });

const slugOf = (domain) => domain.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${res.status}`);
  return { buf: Buffer.from(await res.arrayBuffer()), type: res.headers.get('content-type') || '', url: res.url };
}

/** ImageMagick needs a format hint for ICO and SVG; sniff it from the bytes rather than the URL. */
function formatOf(buf) {
  const head = buf.subarray(0, 12);
  if (head[0] === 0x89 && head[1] === 0x50) return 'png';
  if (head[0] === 0 && head[1] === 0 && head[2] === 1 && head[3] === 0) return 'ico';
  if (head[0] === 0xff && head[1] === 0xd8) return 'jpg';
  if (head.toString('ascii', 0, 3) === 'GIF') return 'gif';
  if (head.toString('ascii', 0, 4) === 'RIFF' && head.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buf.subarray(0, 400).toString('utf8').includes('<svg')) return 'svg';
  return null;
}

const im = (args) => execFileSync('convert', args, { stdio: ['ignore', 'pipe', 'ignore'] });

/** Render any candidate to a 128x128 PNG; for ICO take the largest frame. */
function normalise(file, fmt, dest) {
  let input = `${fmt}:${file}`;
  if (fmt === 'ico') {
    const frames = execFileSync('identify', ['-format', '%p %w\n', input], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().split('\n');
    const best = frames.map((l) => l.split(' ').map(Number)).sort((x, y) => y[1] - x[1])[0];
    input = `${input}[${best?.[0] ?? 0}]`;
  }
  im([...(fmt === 'svg' ? ['-density', '384', '-background', 'none'] : []), input, '-strip', '-resize', '128x128', '-background', 'none', '-gravity', 'center', '-extent', '128x128', `PNG32:${dest}`]);
}

/**
 * Real detail, in pixels: the smallest size it survives a round trip through. A 32px favicon blown up to 256 looks
 * the same after shrinking to 32 and back, so stated size alone is not trusted.
 */
function effectiveRes(png) {
  for (const size of [32, 48, 64, 96]) {
    try {
      const out = execFileSync('bash', ['-c', `convert "${png}" -resize ${size}x${size} -resize 128x128\\! png:- | compare -metric RMSE "${png}" png:- null: 2>&1 || true`]).toString();
      const rmse = Number(out.match(/\(([\d.]+)\)/)?.[1] ?? 1);
      if (rmse < 0.015) return size;
    } catch {
      return 0;
    }
  }
  return 128;
}

/** Candidate icon URLs from the site's own HTML, biggest declared size first. */
async function siteIcons(domain) {
  try {
    const { buf, url } = await get(`https://${domain}/`);
    const html = buf.toString('utf8').slice(0, 300_000);
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
    const icons = links
      .filter((l) => /rel=["'][^"']*(apple-touch-icon|icon)[^"']*["']/i.test(l) && !/mask-icon/i.test(l))
      .map((l) => {
        const href = l.match(/href=["']([^"']+)["']/i)?.[1];
        const size = Number(l.match(/sizes=["'](\d+)x\d+["']/i)?.[1] || (/apple-touch-icon/i.test(l) ? 180 : /\.svg/i.test(l) ? 512 : 32));
        return href ? { href: new URL(href, url).href, size } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.size - a.size);
    return [...icons.map((i) => i.href), new URL('/apple-touch-icon.png', url).href];
  } catch {
    return [`https://${domain}/apple-touch-icon.png`];
  }
}

// Generic icons some sources return when a site has none: Google's blank page (after normalising) and grey letter tiles.
// Also two real-but-wrong results found by eye: a black square for Ather Energy and a grey disc for Cyient.
const PLACEHOLDER_HASHES = new Set(['9e5ac8b76639b18c43d79c3ff5da7c06', '22d5d58770bf49d427b5e185eb595d96', '6ed2345b1d54609bdfc1d638ce371dbc']);
function isPlaceholder(png) {
  const hash = execFileSync('md5sum', [png]).toString().slice(0, 32);
  if (PLACEHOLDER_HASHES.has(hash)) return true;
  const top = execFileSync('bash', ['-c', `convert "${png}" -background white -flatten -format %c histogram:info:- | sort -rn | head -1`]).toString();
  const count = Number(top.trim().split(':')[0]);
  const hex = top.match(/#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i);
  if (!hex) return false;
  const [r, g, b] = hex.slice(1, 4).map((h) => parseInt(h, 16));
  // A light, neutral grey filling most of the tile: the letter avatars services generate for unknown sites.
  const neutralGrey = Math.max(r, g, b) - Math.min(r, g, b) <= 6 && r >= 190 && r <= 242;
  return neutralGrey && count / 16384 > 0.55;
}

async function fetchLogo(name, domain) {
  const slug = slugOf(domain);
  const dest = join(OUT, `${slug}.png`);
  if (!force && existsSync(dest)) return { name, slug, source: 'cached', res: null };
  const sources = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    `https://www.google.com/s2/favicons?domain=www.${domain}&sz=256`,
    `https://favicone.com/${domain}?s=256`,
    ...(await siteIcons(domain)).slice(0, 4),
    `https://icon.horse/icon/${domain}`,
  ];
  let best = null;
  for (const [i, src] of sources.entries()) {
    const tmp = join(tmpdir(), `logo-${slug}-${process.pid}-${i}`);
    try {
      const { buf } = await get(src);
      const fmt = buf.length > 100 ? formatOf(buf) : null;
      if (!fmt) continue;
      writeFileSync(tmp, buf);
      const png = `${tmp}.png`;
      normalise(tmp, fmt, png);
      if (isPlaceholder(png)) {
        rmSync(png, { force: true });
        continue;
      }
      const res = effectiveRes(png);
      if (res >= 32 && (!best || res > best.res)) {
        if (best) rmSync(best.png, { force: true });
        best = { png, res, source: new URL(src).hostname };
      } else rmSync(png, { force: true });
      if (best?.res >= 96) break;
    } catch {
      /* next source */
    } finally {
      rmSync(tmp, { force: true });
    }
  }
  if (!best) return { name, slug, source: null, res: 0 };
  execFileSync('mv', [best.png, dest]);
  return { name, slug, source: best.source, res: best.res };
}

const entries = Object.entries(domains);
// One fetch per domain (several names can share one, e.g. NTT DATA and NTT DATA North America).
const byDomain = new Map();
for (const [name, domain] of entries) byDomain.set(domain, [...(byDomain.get(domain) || []), name]);
const jobs = [...byDomain.entries()];
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (next < jobs.length) {
      const [domain, names] = jobs[next++];
      let r;
      try {
        r = await fetchLogo(names[0], domain);
      } catch {
        r = { name: names[0], slug: slugOf(domain), source: null, res: 0 };
      }
      for (const name of names) results.push({ ...r, name });
    }
  })
);

const manifest = {};
for (const r of results.sort((a, b) => a.name.localeCompare(b.name))) if (r.source) manifest[r.name.toLowerCase()] = `${r.slug}.png`;
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
const missing = results.filter((r) => !r.source).map((r) => `${r.name} (${domains[r.name]})`);
const soft = results.filter((r) => r.res && r.res <= 32).map((r) => r.name);
if (soft.length) console.log('soft (32px detail):', soft.join(', '));
const bySource = results.reduce((m, r) => ((m[r.source || 'missing'] = (m[r.source || 'missing'] || 0) + 1), m), {});
console.log(`logos: ${Object.keys(manifest).length}/${entries.length}`, JSON.stringify(bySource));
if (missing.length) console.log('missing:', missing.join(', '));
