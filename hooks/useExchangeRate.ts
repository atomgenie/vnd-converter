import { useState, useEffect } from 'react';
import { Currency, getRate } from '../data/currencies';

export const useExchangeRate = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

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

  return {
    getRate: (from: Currency, to: Currency) => getRate(from, to),
    isOnline,
  };
};
