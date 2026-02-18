import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Converter } from './components/Converter';
import { useExchangeRate } from './hooks/useExchangeRate';

const App: React.FC = () => {
  const { rateData, isLoading, fetchRate, isOnline } = useExchangeRate();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
      const timer = setTimeout(() => setShowOfflineAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      <main className="w-full max-w-md z-10 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
              VietEuro
            </h1>
            <p className="text-slate-400 text-sm">Currency Converter</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </header>

        {/* Main Card */}
        <Converter 
          rateData={rateData} 
          isLoading={isLoading} 
          onRefresh={fetchRate}
          isOnline={isOnline}
        />

        {/* Footer Info */}
        <footer className="text-center text-slate-500 text-xs mt-8 pb-8">
           <p className="opacity-70">Using Fixed Exchange Rate</p>
        </footer>
      </main>

      {/* Offline Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 transition-all duration-500 ${showOfflineAlert ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <WifiOff size={18} className="text-rose-400" />
        <span className="text-sm font-medium">You are offline.</span>
      </div>

    </div>
  );
};

export default App;