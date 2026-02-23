import React, { useEffect, useRef, useState } from 'react';
import { Download, Wifi, WifiOff } from 'lucide-react';
import { Converter } from './components/Converter';
import { useExchangeRate } from './hooks/useExchangeRate';

const App: React.FC = () => {
  const { rateData, isLoading, fetchRate, isOnline } = useExchangeRate();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const deferredPrompt = useRef<Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as typeof deferredPrompt.current;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      deferredPrompt.current = null;
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt.current = null;
      setCanInstall(false);
    }
  };

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
      const timer = setTimeout(() => setShowOfflineAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background — layered gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-indigo-600/15 rounded-full blur-[120px] animate-subtle-pulse" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[55%] h-[55%] bg-emerald-600/10 rounded-full blur-[120px] animate-subtle-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-violet-600/5 rounded-full blur-[80px]" />
      </div>

      <main className="w-full max-w-md z-10 flex flex-col gap-5">

        {/* Header */}
        <header className="flex justify-between items-start animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
              V€
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-400">
                VietEuro
              </h1>
              <p className="text-slate-500 text-xs tracking-wide">Currency Converter</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {canInstall && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all"
              >
                <Download size={13} />
                <span>Install</span>
              </button>
            )}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isOnline ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' : 'bg-rose-500/10 border-rose-500/15 text-rose-400'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </header>

        {/* Main Card */}
        <div className="animate-fade-in-up-delay">
          <Converter
            rateData={rateData}
            isLoading={isLoading}
            onRefresh={fetchRate}
            isOnline={isOnline}
          />
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-600 text-xs mt-4 pb-6">
          <p>Fixed Exchange Rate &middot; Works Offline</p>
        </footer>
      </main>

      {/* Offline Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 ${showOfflineAlert ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center">
          <WifiOff size={16} className="text-rose-400" />
        </div>
        <div>
          <p className="text-sm font-medium">You're offline</p>
          <p className="text-xs text-slate-400">The app works offline with cached data</p>
        </div>
      </div>
    </div>
  );
};

export default App;
