export type Currency = 'USD' | 'INR';

export interface GeoPricingState {
  currency: Currency;
  detectedCountry: string;
  isAutoDetected: boolean;
  symbol: string;
  monthlyPrice: number;
  monthlyPriceFormatted: string;
  quarterlyPrice: number;
  quarterlyPriceFormatted: string;
}

const STORAGE_KEY = 'careeragent_preferred_currency';

/**
 * Synchronous initial guess based on user's browser timezone and locale
 */
export function getInitialCurrency(): { currency: Currency; country: string } {
  if (typeof window === 'undefined') {
    return { currency: 'USD', country: 'US' };
  }

  // Check saved manual override
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'USD' || saved === 'INR') {
    return { currency: saved, country: saved === 'INR' ? 'IN' : 'US' };
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = navigator.language || '';
    if (tz.includes('Calcutta') || tz.includes('Kolkata') || lang.endsWith('-IN') || lang === 'hi') {
      return { currency: 'INR', country: 'IN' };
    }
  } catch {
    // ignore
  }

  return { currency: 'USD', country: 'US' };
}

/**
 * Fetch client IP location to verify dynamic PPP pricing
 */
export async function detectCountryFromIP(): Promise<{ currency: Currency; country: string } | null> {
  // If user previously made an explicit manual choice, respect it
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'USD' || saved === 'INR') {
    return { currency: saved, country: saved === 'INR' ? 'IN' : 'US' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('https://api.country.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const country = data.country || 'US';
      const currency: Currency = country === 'IN' ? 'INR' : 'USD';
      return { currency, country };
    }
  } catch {
    // Fallback gracefully on timeout or network block
  }

  return null;
}

export function savePreferredCurrency(currency: Currency) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, currency);
  }
}
