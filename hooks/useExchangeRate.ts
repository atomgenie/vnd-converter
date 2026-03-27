import { useState, useEffect, useCallback } from 'react';
import { Currency, getRate as getFallbackRate } from '../data/currencies';

const BASE_CURRENCY = Currency.EUR;
const LIVE_SYMBOLS = [Currency.USD, Currency.VND] as const;

type LiveRates = Partial<Record<Currency, number>>;

interface FrankfurterResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export const useExchangeRate = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [liveRates, setLiveRates] = useState<LiveRates | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLatestRates = async () => {
      try {
        const params = new URLSearchParams({
          from: BASE_CURRENCY,
          symbols: LIVE_SYMBOLS.join(','),
        });

        const response = await fetch(`https://api.frankfurter.app/latest?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to fetch exchange rates (${response.status})`);
        }

        const payload = await response.json() as FrankfurterResponse;

        const nextRates: LiveRates = {
          [Currency.EUR]: 1,
          [Currency.USD]: payload.rates[Currency.USD],
          [Currency.VND]: payload.rates[Currency.VND],
        };

        const hasAllRates = Object.values(Currency).every((currency) => {
          const rate = nextRates[currency];
          return typeof rate === 'number' && Number.isFinite(rate) && rate > 0;
        });

        if (hasAllRates) {
          setLiveRates(nextRates);
        }
      } catch {
        // Keep static fallback rates when network/API is unavailable.
      }
    };

    fetchLatestRates();

    return () => {
      controller.abort();
    };
  }, [isOnline]);

  const getRate = useCallback((from: Currency, to: Currency) => {
    if (!liveRates) {
      return getFallbackRate(from, to);
    }

    if (from === to) return 1;

    const fromRate = liveRates[from];
    const toRate = liveRates[to];

    if (!fromRate || !toRate) {
      return getFallbackRate(from, to);
    }

    return toRate / fromRate;
  }, [liveRates]);

  return {
    getRate,
    isOnline,
  };
};
