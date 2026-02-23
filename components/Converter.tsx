import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { ArrowDownUp, Euro, Banknote, X, TrendingUp, Check, Copy } from 'lucide-react';
import { ExchangeRateData, Currency } from '../types';

const VND_MEDIAN_INCOME = 6_500_000;
const EUR_MEDIAN_INCOME = 2_190;

const PRESETS: Record<'EUR_TO_VND' | 'VND_TO_EUR', { label: string; value: string }[]> = {
  EUR_TO_VND: [
    { label: '10', value: '10' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
    { label: '500', value: '500' },
  ],
  VND_TO_EUR: [
    { label: '100K', value: '100000' },
    { label: '500K', value: '500000' },
    { label: '1M', value: '1000000' },
    { label: '5M', value: '5000000' },
  ],
};

interface ConverterProps {
  rateData: ExchangeRateData | null;
  isLoading: boolean;
  onRefresh: () => void;
  isOnline: boolean;
}

export const Converter: React.FC<ConverterProps> = ({ rateData }) => {
  const [amount, setAmount] = useState<string>('');
  const [direction, setDirection] = useState<'EUR_TO_VND' | 'VND_TO_EUR'>('VND_TO_EUR');
  const [result, setResult] = useState<number>(0);
  const [copied, setCopied] = useState(false);
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

  const handleClear = () => {
    setAmount('');
    nextCursorPos.current = null;
    inputRef.current?.focus();
  };

  const formatDisplayValue = (val: string) => {
    if (!val) return '';
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  };

  useLayoutEffect(() => {
    if (nextCursorPos.current === null || !inputRef.current) return;

    const formatted = formatDisplayValue(amount);
    const rawPos = nextCursorPos.current;
    nextCursorPos.current = null;

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

    const val = inputVal.replace(/\s/g, '');

    if (val === '' || /^\d*\.?\d*$/.test(val)) {
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

  const handleCopy = useCallback(async () => {
    if (!result || !rateData) return;
    const toCurrency = direction === 'EUR_TO_VND' ? Currency.VND : Currency.EUR;
    const text = formatCurrency(result, toCurrency);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API not available
    }
  }, [result, direction, rateData]);

  const handlePreset = (value: string) => {
    nextCursorPos.current = null;
    setAmount(value);
    inputRef.current?.focus();
  };

  const fromCurrency = direction === 'EUR_TO_VND' ? Currency.EUR : Currency.VND;
  const toCurrency = direction === 'EUR_TO_VND' ? Currency.VND : Currency.EUR;
  const fromFlag = fromCurrency === Currency.EUR ? '\u{1F1EA}\u{1F1FA}' : '\u{1F1FB}\u{1F1F3}';
  const toFlag = toCurrency === Currency.EUR ? '\u{1F1EA}\u{1F1FA}' : '\u{1F1FB}\u{1F1F3}';

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/8 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

      {/* From Input */}
      <div className="input-glow bg-slate-800/40 p-4 rounded-2xl border border-slate-700/40 transition-all">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-xs font-medium flex items-center gap-2 uppercase tracking-wider">
            <span className="text-base leading-none">{fromFlag}</span>
            {fromCurrency}
          </span>
          <span className="text-slate-600 text-xs">From</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={formatDisplayValue(amount)}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-slate-700 tabular-nums"
          />
          {amount && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear amount"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex gap-2 mt-3">
          {PRESETS[direction].map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePreset(preset.value)}
              className={`preset-btn px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                amount === preset.value
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-slate-300 hover:border-slate-600/60'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-4 relative z-10">
        <button
          onClick={handleSwap}
          className="swap-btn bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-95 border-[3px] border-slate-900/80"
        >
          <ArrowDownUp size={18} className="swap-icon" />
        </button>
      </div>

      {/* Result Display */}
      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/40">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-xs font-medium flex items-center gap-2 uppercase tracking-wider">
            <span className="text-base leading-none">{toFlag}</span>
            {toCurrency}
          </span>
          <span className="text-slate-600 text-xs">To</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-3xl font-bold text-emerald-400 break-all result-text tabular-nums min-h-[2.25rem]">
            {rateData ? (result > 0 ? formatCurrency(result, toCurrency) : <span className="text-slate-700">0</span>) : '...'}
          </div>
          {result > 0 && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy result"
              className="copy-btn p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors flex-shrink-0"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Income Proportion Estimate (VND -> EUR only) */}
      {direction === 'VND_TO_EUR' && result > 0 && (() => {
        const proportion = parseFloat(amount) / VND_MEDIAN_INCOME;
        const eurEquivalent = proportion * EUR_MEDIAN_INCOME;
        const percentStr = (proportion * 100).toLocaleString('en', { maximumFractionDigits: 1 });
        const eurStr = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(eurEquivalent);
        return (
          <div className="mt-4 bg-amber-950/20 border border-amber-800/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={13} className="text-amber-400/80" />
              <span className="text-amber-400/80 text-xs font-semibold uppercase tracking-wider">Income proportion</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {percentStr}% of VN median income ({'\u20AB'}{VND_MEDIAN_INCOME.toLocaleString('vi-VN')}/mo){' '}
              {'\u2192'} equiv.{' '}
              <span className="text-amber-300/90 font-semibold">{eurStr}</span>{' '}
              in France ({EUR_MEDIAN_INCOME.toLocaleString('de-DE')} {'\u20AC'}/mo).
            </p>
          </div>
        );
      })()}

      {/* Rate Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800/60 flex justify-between items-center text-[11px] text-slate-600 font-mono">
        <span>1 EUR = {rateData ? new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(rateData.rate) : '...'} VND</span>
        <span>Fixed rate</span>
      </div>
    </div>
  );
};
