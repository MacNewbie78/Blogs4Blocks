import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem('b4b_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('b4b_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 animate-fade-in-up" data-testid="pwa-install-banner">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black">
              <span className="text-b4b-red">B</span>
              <span className="text-b4b-green">4</span>
              <span className="text-b4b-blue">B</span>
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-sm text-gray-900">Install Blogs 4 Blocks</p>
            <p className="text-xs text-gray-500 mt-0.5">Get the app experience — quick access from your home screen.</p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-black text-white hover:bg-gray-800 rounded-full font-bold text-xs h-8 shadow-[2px_2px_0px_0px_rgba(59,130,246,0.4)]"
                data-testid="pwa-install-btn"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Install App
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 rounded-full text-xs h-8"
                data-testid="pwa-dismiss-btn"
              >
                Not now
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
