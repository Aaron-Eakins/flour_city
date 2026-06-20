import { useCallback, useEffect, useRef } from 'react';
import { SITE_CONFIG } from '../constants/site';

// Shared Cloudflare Turnstile hook with DEFERRED execution.
//
// The widget renders as a small idle indicator but does NOT run the challenge on
// load — it only runs when execute() is called, which the forms do on submit. This
// replaces the duplicated render-and-poll pattern AND the old behavior where the
// challenge fired on every form view.
//
// Usage:
//   const { execute, reset, containerRef } = useTurnstile();
//   <div ref={containerRef} />               // the visible Turnstile indicator
//   // in submit handler:
//   const token = await execute();
//   if (!token) { ...show verification error... } else { ...send with token... }
export function useTurnstile() {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  // Holds the in-flight execute() resolver so Turnstile's callbacks can settle it.
  const settleRef = useRef(null);

  useEffect(() => {
    let pollTimer = null;

    const render = () => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_CONFIG.TURNSTILE_SITE_KEY,
        execution: 'execute',  // defer the challenge until execute() is called (on submit)
        appearance: 'execute', // stay invisible until execute() runs — no idle box
        theme: 'light',
        callback: (t) => { settleRef.current?.(t); },
        'error-callback': () => { settleRef.current?.(''); },
        'timeout-callback': () => { settleRef.current?.(''); },
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
      if (widgetIdRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* already gone */ }
        widgetIdRef.current = null;
      }
    };
  }, []);

  // Run the challenge now; resolves with a fresh token, or '' on error/timeout.
  // Call this from the submit handler so the challenge only runs on a real click.
  const execute = useCallback(() => new Promise((resolve) => {
    if (!window.turnstile || widgetIdRef.current === null) { resolve(''); return; }

    let done = false;
    let safety;
    const settle = (t) => {
      if (done) return;
      done = true;
      clearTimeout(safety);
      settleRef.current = null;
      resolve(t || '');
    };
    // Never let a silent Turnstile hang the form.
    safety = setTimeout(() => settle(''), 20000);
    settleRef.current = settle;

    try {
      window.turnstile.reset(widgetIdRef.current);   // clear any prior result
      window.turnstile.execute(widgetIdRef.current); // run the managed challenge now
    } catch {
      settle('');
    }
  }), []);

  const reset = useCallback(() => {
    if (widgetIdRef.current !== null && window.turnstile) {
      try { window.turnstile.reset(widgetIdRef.current); } catch { /* no-op */ }
    }
  }, []);

  return { execute, reset, containerRef };
}
