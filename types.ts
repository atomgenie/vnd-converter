export interface SourceUrl {
  title: string;
  uri: string;
}

export interface ExchangeRateData {
  rate: number; // 1 EUR to VND
  lastUpdated: string; // ISO date string
  source?: string;
  sourceUrls?: SourceUrl[];
}

export enum Currency {
  VND = 'VND',
  EUR = 'EUR',
}

export interface ConversionState {
  from: Currency;
  to: Currency;
  amount: string;
}