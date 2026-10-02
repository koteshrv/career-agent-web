import { useEffect, useState } from 'react';

/** Postings pinned to For you by hand, on top of what the search defaults bring in. Ids only; details are fetched. */
const KEY = 'careeragent_foryou_pins';
const EVENT = 'careeragent_foryou_updated';

export function getPins(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function togglePin(id: string): boolean {
  const pins = getPins();
  const next = pins.includes(id) ? pins.filter((p) => p !== id) : [id, ...pins].slice(0, 200);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
  return next.includes(id);
}

export function usePins(): string[] {
  const [pins, setPins] = useState(getPins);
  useEffect(() => {
    const update = () => setPins(getPins());
    window.addEventListener(EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return pins;
}
