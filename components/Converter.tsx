import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { ArrowDownUp, X, TrendingUp, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Currency,
  ALL_CURRENCIES,
  CURRENCY_CONFIGS,
  PRESETS,
  INCOME_DATA,
} from '../data/currencies';

const LS_FROM_KEY = 'vnd-converter-from';
const LS_TO_KEY = 'vnd-converter-to';

function loadCurrency(key: string, fallback: Currency): Currency {
  try {
    const stored = localStorage.getItem(key);
    if (stored && Object.values(Currency).includes(stored as Currency)) {
      return stored as Currency;
    }
  } catch {
    // localStorage unavailable
  }
  return fallback;
}

interface ConverterProps {
  getRate: (from: Currency, to: Currency) => number;
}

export const Converter: React.FC<ConverterProps> = ({ getRate }) => {
  const [fromCurrency, setFromCurrency] = useState<Currency>(() => loadCurrency(LS_FROM_KEY, Currency.VND));
  const [toCurrency, setToCurrency] = useState<Currency>(() => loadCurrency(LS_TO_KEY, Currency.EUR));
  const [amount, setAmount] = useState<string>('');
  const [result, setResult] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextCursorPos = useRef<number | null>(null);

  // Persist currency selections
  useEffect(() => {
    try { localStorage.setItem(LS_FROM_KEY, fromCurrency); } catch {}
  }, [fromCurrency]);
  useEffect(() => {
    try { localStorage.setItem(LS_TO_KEY, toCurrency); } catch {}
  }, [toCurrency]);

  const rate = getRate(fromCurrency, toCurrency);

  useEffect(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || !rate) {
      setResult(0);
      return;
    }
    setResult(val * rate);
  }, [amount, rate]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleFromChange = (currency: Currency) => {
    if (currency === toCurrency) {
      // Swap if selecting the same currency
      setToCurrency(fromCurrency);
    }
    setFromCurrency(currency);
  };

  const handleToChange = (currency: Currency) => {
    if (currency === fromCurrency) {
      setFromCurrency(toCurrency);
    }
    setToCurrency(currency);
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
    const config = CURRENCY_CONFIGS[currency];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: config.fractionDigits,
    }).format(val);
  };

  const handleCopy = useCallback(async () => {
    if (!result) return;
    const text = formatCurrency(result, toCurrency);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API not available
    }
  }, [result, toCurrency]);

  const handlePreset = (value: string) => {
    nextCursorPos.current = null;
    setAmount(value);
    inputRef.current?.focus();
  };

  const fromConfig = CURRENCY_CONFIGS[fromCurrency];
  const toConfig = CURRENCY_CONFIGS[toCurrency];

  // Income comparison data for the current pair
  const incomeKey = `${fromCurrency}→${toCurrency}`;
  const incomeData = INCOME_DATA[incomeKey];

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/8 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

      {/* From Input */}
      <div className="input-glow bg-slate-800/40 p-4 rounded-2xl border border-slate-700/40 transition-all">
        <div className="flex justify-between items-center mb-2">
          <CurrencySelector
            value={fromCurrency}
            onChange={handleFromChange}
            exclude={null}
          />
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
          {PRESETS[fromCurrency].map(preset => (
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
          <CurrencySelector
            value={toCurrency}
            onChange={handleToChange}
            exclude={null}
          />
          <span className="text-slate-600 text-xs">To</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-3xl font-bold text-emerald-400 break-all result-text tabular-nums min-h-[2.25rem]">
            {result > 0 ? formatCurrency(result, toCurrency) : <span className="text-slate-700">0</span>}
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

      {/* Income Proportion Estimate (only when data exists for this pair) */}
      {incomeData && result > 0 && (() => {
        const { from: incFrom, to: incTo } = incomeData;
        const proportion = parseFloat(amount) / incFrom.medianIncome;
        const equivalentInTo = proportion * incTo.medianIncome;
        const percentStr = (proportion * 100).toLocaleString('en', { maximumFractionDigits: 1 });
        const equivStr = formatCurrency(equivalentInTo, toCurrency);

        const intlDollars = parseFloat(amount) / incFrom.pppPerIntlDollar;
        const pppEquiv = intlDollars * incTo.pppPerIntlDollar;
        const pppStr = formatCurrency(pppEquiv, toCurrency);

        const proportionQ1 = parseFloat(amount) / incFrom.q1Income;
        const equivalentQ1 = proportionQ1 * incTo.q1Income;
        const percentStrQ1 = (proportionQ1 * 100).toLocaleString('en', { maximumFractionDigits: 1 });
        const equivStrQ1 = formatCurrency(equivalentQ1, toCurrency);

        return (
          <div className="mt-4 bg-amber-950/20 border border-amber-800/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={13} className="text-amber-400/80" />
              <span className="text-amber-400/80 text-xs font-semibold uppercase tracking-wider">Income proportion</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {percentStr}% of {incFrom.countryName} median income ({incFrom.currencySymbol}{incFrom.medianIncome.toLocaleString()}/mo){' '}
              {'\u2192'} equiv.{' '}
              <span className="text-amber-300/90 font-semibold">{equivStr}</span>{' '}
              in {incTo.countryName} ({incTo.medianIncome.toLocaleString()} {incTo.currencySymbol}/mo).
            </p>
            <button
              type="button"
              onClick={() => setShowMore(v => !v)}
              className="mt-2 flex items-center gap-1 text-xs text-amber-500/60 hover:text-amber-400 transition-colors"
            >
              {showMore ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showMore ? 'Show less' : 'Show more'}
            </button>
            {showMore && (
              <div className="mt-2 pt-2 border-t border-amber-800/20 space-y-2">
                <p className="text-slate-400 text-sm leading-relaxed">
                  PPP equivalent:{' '}
                  <span className="text-amber-300/90 font-semibold">{pppStr}</span>{' '}
                  (÷{incFrom.pppPerIntlDollar.toLocaleString()} {fromCurrency}/Int$, ×{incTo.pppPerIntlDollar} {toCurrency}/Int$).
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {percentStrQ1}% of {incFrom.countryName} Q1 income ({incFrom.currencySymbol}{incFrom.q1Income.toLocaleString()}/mo){' '}
                  {'\u2192'} equiv.{' '}
                  <span className="text-amber-300/90 font-semibold">{equivStrQ1}</span>{' '}
                  in {incTo.countryName} (Q1 · {incTo.q1Income.toLocaleString()} {incTo.currencySymbol}/mo).
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Rate Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800/60 flex justify-between items-center text-[11px] text-slate-600 font-mono">
        <span>1 {fromCurrency} = {new Intl.NumberFormat(toConfig.locale, { maximumFractionDigits: toConfig.fractionDigits }).format(rate)} {toCurrency}</span>
        <span>Fixed rate</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Currency Selector Component
// ---------------------------------------------------------------------------

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  exclude: Currency | null;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const config = CURRENCY_CONFIGS[value];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider hover:text-slate-200 transition-colors"
      >
        <span className="text-base leading-none">{config.flag}</span>
        {value}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden min-w-[160px]">
          {ALL_CURRENCIES.map(currency => {
            const c = CURRENCY_CONFIGS[currency];
            const isSelected = currency === value;
            return (
              <button
                key={currency}
                type="button"
                onClick={() => { onChange(currency); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="font-medium">{currency}</span>
                <span className="text-slate-500 text-xs">{c.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
