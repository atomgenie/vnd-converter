import { useState, useEffect } from 'react';
import { ExchangeRateData } from '../types';

// Fixed Rate: 10 000 000 000 VND = 326 224 EUR
// 1 EUR = 10 000 000 000 / 326 224 ≈ 30 653.78 VND
// 1 VND = 326 224 / 10 000 000 000 = 0.0000326224 EUR
const RATE_EUR_TO_VND = 10_000_000_000 / 326_224;

export const useExchangeRate = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Static rate data
  const rateData: ExchangeRateData = {
    rate: RATE_EUR_TO_VND,
    lastUpdated: new Date().toISOString(),
    source: "Fixed Rate (10 000 000 000 VND = 326 224 EUR)"
  };

  // Monitor network status for UI feedback only
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

  // No-op function since rate is fixed
  const fetchRate = () => {};

  return { 
    rateData, 
    isLoading: false, 
    error: null, 
    fetchRate, 
    isOnline 
  };
};