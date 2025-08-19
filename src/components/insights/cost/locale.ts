// File: src/components/insights/cost/locale.ts
export interface CurrencyLocale {
  currency: string;
  locale: string;
  warning?: string;
}

const LOCATION_TO_CURRENCY: Record<string, CurrencyLocale> = {
  'United States': { currency: 'USD', locale: 'en-US' },
  Canada: { currency: 'CAD', locale: 'en-CA' },
  'United Kingdom': { currency: 'GBP', locale: 'en-GB' },
  Australia: { currency: 'AUD', locale: 'en-AU' },
  Singapore: { currency: 'SGD', locale: 'en-SG' },
};

export function resolveCurrencyAndLocale(location: string | undefined): CurrencyLocale {
  if (!location) {
    return {
      currency: 'USD',
      locale: 'en-US',
      warning: 'Unknown location; defaulted to USD/en-US',
    };
  }
  const found = LOCATION_TO_CURRENCY[location];
  if (found) return found;
  return {
    currency: 'USD',
    locale: 'en-US',
    warning: `Unsupported location "${location}"; defaulted to USD/en-US`,
  };
}

export function formatCurrency(value: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    // Fallback to en-US
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
}
