import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ArrowDownUp, Euro, Banknote } from 'lucide-react';
import { ExchangeRateData, Currency } from '../types';

interface ConverterProps {
  rateData: ExchangeRateData | null;
  isLoading: boolean;
  onRefresh: () => void;
  isOnline: boolean;
}

export const Converter: React.FC<ConverterProps> = ({ rateData }) => {
  const [amount, setAmount] = useState<string>('100000');
  const [direction, setDirection] = useState<'EUR_TO_VND' | 'VND_TO_EUR'>('VND_TO_EUR');
  const [result, setResult] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextCursorPos = useRef<number | null>(null);

  const rate = rateData?.rate || 0;

  useEffect(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || !rate) {
      setResult(0);
      return;
    }

    if (direction === 'EUR_TO_VND') {
      setResult(val * rate);
    } else {
      setResult(val / rate);
    }
  }, [amount, direction, rate]);

  const handleSwap = () => {
    setDirection(prev => prev === 'EUR_TO_VND' ? 'VND_TO_EUR' : 'EUR_TO_VND');
  };

  const formatDisplayValue = (val: string) => {
    if (!val) return '';
    const parts = val.split('.');
    // Add spaces to integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join('.');
  };

  useLayoutEffect(() => {
    if (nextCursorPos.current === null || !inputRef.current) return;

    const formatted = formatDisplayValue(amount);
    const rawPos = nextCursorPos.current;
    nextCursorPos.current = null;

    // Map raw cursor position (ignoring spaces) back to the formatted string position
    let nonSpaceSeen = 0;
    let formattedCursorPos = formatted.length;
    for (let i = 0; i < formatted.length; i++) {
      if (nonSpaceSeen === rawPos) {
        formattedCursorPos = i;
        break;
      }
      if (formatted[i] !== ' ') {
        nonSpaceSeen++;
      }
    }

    inputRef.current.setSelectionRange(formattedCursorPos, formattedCursorPos);
  }, [amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const cursorPosition = e.target.selectionStart ?? inputVal.length;

    // Remove spaces to get raw value
    const val = inputVal.replace(/\s/g, '');

    // Allow only numbers and one decimal point
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      // Track cursor position in terms of non-space characters before it
      const spacesBeforeCursor = (inputVal.slice(0, cursorPosition).match(/\s/g) || []).length;
      nextCursorPos.current = cursorPosition - spacesBeforeCursor;
      setAmount(val);
    }
  };

  const formatCurrency = (val: number, currency: Currency) => {
    return new Intl.NumberFormat(currency === Currency.VND ? 'vi-VN' : 'de-DE', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: currency === Currency.VND ? 0 : 2
    }).format(val);
  };

  const fromCurrency = direction === 'EUR_TO_VND' ? Currency.EUR : Currency.VND;
  const toCurrency = direction === 'EUR_TO_VND' ? Currency.VND : Currency.EUR;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-200">Converter</h2>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        
        {/* From Input */}
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 focus-within:border-indigo-500/50 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
              {fromCurrency === Currency.EUR ? <Euro size={14} /> : <Banknote size={14} />}
              {fromCurrency}
            </span>
          </div>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={formatDisplayValue(amount)}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-slate-600"
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-6 relative z-10">
          <button 
            onClick={handleSwap}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-900/50 transition-transform active:scale-95 border-4 border-slate-900"
          >
            <ArrowDownUp size={20} />
          </button>
        </div>

        {/* Result Display */}
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
               {toCurrency === Currency.EUR ? <Euro size={14} /> : <Banknote size={14} />}
               {toCurrency}
            </span>
          </div>
          <div className="text-3xl font-bold text-emerald-400 break-all">
            {rateData ? formatCurrency(result, toCurrency) : '...'}
          </div>
        </div>
      </div>

      {/* Current Rate Display */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-mono">
        <span>Fixed Rate</span>
        <span>
          1 VND = 0,000033 EUR
        </span>
      </div>
    </div>
  );
};