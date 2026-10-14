import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mthfr_iq_cookie_consent_v1';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (!v) setVisible(true);
    } catch {
      // localStorage may be blocked — show banner anyway
      setVisible(true);
    }
  }, []);

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 fade-in">
      <div className="max-w-3xl mx-auto bg-white border border-taupe1 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 text-sm text-brown1">
          <p className="font-semibold heading text-brown1 mb-1">Cookies & Privacy</p>
          <p className="text-brown2 leading-relaxed">
            We use minimal local browser storage to remember your progress and preferences. We do not use tracking cookies, sell your data, or share it with advertisers. By continuing, you agree to our minimal data use.{' '}
            <a href="/privacy" className="underline text-amber1">Privacy details</a>
          </p>
        </div>
        <button onClick={accept} className="btn-primary text-sm whitespace-nowrap">
          Got It
        </button>
      </div>
    </div>
  );
}
