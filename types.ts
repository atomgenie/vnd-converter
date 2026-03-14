export { Currency } from './data/currencies';

export interface SourceUrl {
  title: string;
  uri: string;
}

export interface ExchangeRateData {
  rate: number;
  lastUpdated: string;
  source?: string;
  sourceUrls?: SourceUrl[];
}

export interface ConversionState {
  from: string;
  to: string;
  amount: string;
}
