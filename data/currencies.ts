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
      medianIncome: 7_700_000,   // Vietnam NSO 2024 avg monthly employee income
      q1Income: 5_200_000,       // Est. Q1 from min wage & rural/agri avg (2024)
      pppPerIntlDollar: 6_957,   // World Bank 2024
      currencySymbol: '\u20AB',
      countryName: 'VN',
    },
    to: {
      medianIncome: 2_183,       // INSEE/staffmatch 2025 median net/month
      q1Income: 1_700,           // Est. from decile data (D1=1,366, median=2,183)
      pppPerIntlDollar: 0.70,    // World Bank 2024
      currencySymbol: '\u20AC',
      countryName: 'France',
    },
  },
  'EUR→VND': {
    from: {
      medianIncome: 2_183,
      q1Income: 1_700,
      pppPerIntlDollar: 0.70,
      currencySymbol: '\u20AC',
      countryName: 'France',
    },
    to: {
      medianIncome: 7_700_000,
      q1Income: 5_200_000,
      pppPerIntlDollar: 6_957,
      currencySymbol: '\u20AB',
      countryName: 'VN',
    },
  },
  'VND→USD': {
    from: {
      medianIncome: 7_700_000,
      q1Income: 5_200_000,
      pppPerIntlDollar: 6_957,
      currencySymbol: '\u20AB',
      countryName: 'VN',
    },
    to: {
      medianIncome: 4_200,       // BLS Q4 2024 median full-time, ~net after tax
      q1Income: 2_800,           // Est. Q1 full-time workers, ~net after tax
      pppPerIntlDollar: 1.00,    // USD is the reference currency
      currencySymbol: '$',
      countryName: 'US',
    },
  },
  'USD→VND': {
    from: {
      medianIncome: 4_200,
      q1Income: 2_800,
      pppPerIntlDollar: 1.00,
      currencySymbol: '$',
      countryName: 'US',
    },
    to: {
      medianIncome: 7_700_000,
      q1Income: 5_200_000,
      pppPerIntlDollar: 6_957,
      currencySymbol: '\u20AB',
      countryName: 'VN',
    },
  },
  'EUR→USD': {
    from: {
      medianIncome: 2_183,
      q1Income: 1_700,
      pppPerIntlDollar: 0.70,
      currencySymbol: '\u20AC',
      countryName: 'France',
    },
    to: {
      medianIncome: 4_200,
      q1Income: 2_800,
      pppPerIntlDollar: 1.00,
      currencySymbol: '$',
      countryName: 'US',
    },
  },
  'USD→EUR': {
    from: {
      medianIncome: 4_200,
      q1Income: 2_800,
      pppPerIntlDollar: 1.00,
      currencySymbol: '$',
      countryName: 'US',
    },
    to: {
      medianIncome: 2_183,
      q1Income: 1_700,
      pppPerIntlDollar: 0.70,
      currencySymbol: '\u20AC',
      countryName: 'France',
    },
  },
};

/**
 * Helper to get the list of all available currencies.
 */
export const ALL_CURRENCIES: Currency[] = Object.values(Currency);
