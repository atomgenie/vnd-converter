export enum Currency {
  VND = 'VND',
  EUR = 'EUR',
  USD = 'USD',
}

export interface CurrencyConfig {
  code: Currency;
  name: string;
  flag: string;
  locale: string;
  fractionDigits: number;
}

export interface Preset {
  label: string;
  value: string;
}

export interface IncomeComparisonData {
  medianIncome: number;
  q1Income: number;
  pppPerIntlDollar: number;
  currencySymbol: string;
  countryName: string;
}

// ---------------------------------------------------------------------------
// Currency configurations
// ---------------------------------------------------------------------------

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  [Currency.VND]: {
    code: Currency.VND,
    name: 'Vietnamese Dong',
    flag: '\u{1F1FB}\u{1F1F3}',
    locale: 'vi-VN',
    fractionDigits: 0,
  },
  [Currency.EUR]: {
    code: Currency.EUR,
    name: 'Euro',
    flag: '\u{1F1EA}\u{1F1FA}',
    locale: 'de-DE',
    fractionDigits: 2,
  },
  [Currency.USD]: {
    code: Currency.USD,
    name: 'US Dollar',
    flag: '\u{1F1FA}\u{1F1F8}',
    locale: 'en-US',
    fractionDigits: 2,
  },
};

// ---------------------------------------------------------------------------
// Exchange rates — all expressed as "1 EUR = X <currency>"
// To convert between any pair: amount * (rateOf(to) / rateOf(from))
// ---------------------------------------------------------------------------

export const RATES_FROM_EUR: Record<Currency, number> = {
  [Currency.EUR]: 1,
  [Currency.VND]: 10_000_000_000 / 326_224, // ≈ 30 653.78
  [Currency.USD]: 1.08,
};

/**
 * Get the exchange rate from one currency to another.
 * Uses EUR as the base: rate = RATES_FROM_EUR[to] / RATES_FROM_EUR[from]
 */
export function getRate(from: Currency, to: Currency): number {
  if (from === to) return 1;
  return RATES_FROM_EUR[to] / RATES_FROM_EUR[from];
}

// ---------------------------------------------------------------------------
// Quick-fill presets per currency
// ---------------------------------------------------------------------------

export const PRESETS: Record<Currency, Preset[]> = {
  [Currency.EUR]: [
    { label: '10', value: '10' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
    { label: '500', value: '500' },
  ],
  [Currency.USD]: [
    { label: '10', value: '10' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
    { label: '500', value: '500' },
  ],
  [Currency.VND]: [
    { label: '100K', value: '100000' },
    { label: '500K', value: '500000' },
    { label: '1M', value: '1000000' },
    { label: '5M', value: '5000000' },
  ],
};

// ---------------------------------------------------------------------------
// Income comparison data (keyed by "from→to" pair)
// Only pairs with data will show the income proportion section.
// ---------------------------------------------------------------------------

export const INCOME_DATA: Record<string, { from: IncomeComparisonData; to: IncomeComparisonData }> = {
  'VND→EUR': {
    from: {
      medianIncome: 6_500_000,
      q1Income: 4_500_000,
      pppPerIntlDollar: 7_130,
      currencySymbol: '\u20AB',
      countryName: 'VN',
    },
    to: {
      medianIncome: 2_190,
      q1Income: 1_790,
      pppPerIntlDollar: 0.66,
      currencySymbol: '\u20AC',
      countryName: 'France',
    },
  },
};

/**
 * Helper to get the list of all available currencies.
 */
export const ALL_CURRENCIES: Currency[] = Object.values(Currency);
