export const PALETTES = [
  { id: 'slate', label: 'Slate', swatch: ['#f6f7f9', '#2f6fed', '#1a1d23'] },
  { id: 'graphite', label: 'Graphite', swatch: ['#ffffff', '#171717', '#707070'] },
  { id: 'warm', label: 'Warm', swatch: ['#faf9f5', '#c96442', '#1f1e1b'] },
  { id: 'indigo', label: 'Indigo', swatch: ['#f7f7fb', '#5b5bd6', '#1b1b2a'] },
  { id: 'forest', label: 'Forest', swatch: ['#f5f8f6', '#1f8a5b', '#17221b'] },
] as const;
export type PaletteId = (typeof PALETTES)[number]['id'];

const KEY = 'careeragent-palette';

export function getPalette(): PaletteId {
  try {
    const v = localStorage.getItem(KEY);
    if (v && PALETTES.some((p) => p.id === v)) return v as PaletteId;
  } catch {}
  return 'slate';
}

/** Sets the palette on <html>; "slate" is the base tokens so it clears the attribute. */
export function applyPalette(id: PaletteId) {
  if (id === 'slate') delete document.documentElement.dataset.palette;
  else document.documentElement.dataset.palette = id;
}

export function setPalette(id: PaletteId) {
  try { localStorage.setItem(KEY, id); } catch {}
  applyPalette(id);
}
