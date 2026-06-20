import { useCallback, useEffect, useRef, useState } from 'react';
import { SITE_CONFIG } from '../constants/site';

// Shared Cloudflare Turnstile hook. Replaces the duplicated render-and-poll
// pattern that lived in every form (QuoteLab, ContactView, EmailCheckupView,
// ProjectNoteForm).
//
// Key behavior change: the widget renders with appearance 'interaction-only', so
// it stays invisible while the user browses and completes the managed challenge
// in the background — no more Turnstile box appearing on every form. It only
// surfaces UI if Cloudflare actually requires human interaction. The token still
// arrives via the callback, so the existing "submit disabled until token" flow is
// unchanged.
//
// Usage:
//   const { token, reset, containerRef } = useTurnstile();
//   ...
//   <div ref={containerRef} />            // mount point (was an id'd div)
//   ...submit: guard on `token`, send it, then call `reset()` on success.
export function useTurnstile() {
  const [token, setToken] = useState('');
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    let pollTimer = null;

    const render = () => {
      // Render once, only when the script is ready and the mount point exists.
      if (!window.turnstile || !containerRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_CONFIG.TURNSTILE_SITE_KEY,
        appearance: 'interaction-only',
        theme: 'light',
        callback: (t) => setToken(t),
        'error-callback': () => setToken(''),
        'expired-callback': () => setToken(''),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      pollTimer = setInterval(() => {
        if (window.turnstile) {
          render();
          clearInterval(pollTimer);
          pollTimer = null;
        }
      }, 300);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      // Tear the widget down on unmount so SPA navigation doesn't leave orphans
      // or double-render on return.
      if (widgetIdRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* already gone */ }
        widgetIdRef.current = null;
      }
    };
  }, []);

  const reset = useCallback(() => {
    setToken('');
    if (widgetIdRef.current !== null && window.turnstile) {
      try { window.turnstile.reset(widgetIdRef.current); } catch { /* no-op */ }
    }
  }, []);

  return { token, reset, containerRef };
}
