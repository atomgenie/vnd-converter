import { useState, useEffect } from 'react';
import { ExchangeRateData } from '../types';

// Fixed Rate: 1 VND = 0.000033 EUR
// The app uses EUR to VND as base rate.
// 1 EUR = 1 / 0.000033 VND
const RATE_EUR_TO_VND = 1 / 0.000033;

export const useExchangeRate = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Static rate data
  const rateData: ExchangeRateData = {
    rate: RATE_EUR_TO_VND,
    lastUpdated: new Date().toISOString(),
    source: "Fixed Rate (1 VND = 0,000033 EUR)"
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