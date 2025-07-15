// src/utils/sentryConsoleCapture.js
import * as Sentry from '@sentry/react';

function captureConsoleLogs() {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };

  ['log', 'warn', 'error', 'info'].forEach((method) => {
    console[method] = (...args) => {
      // Send to Sentry as breadcrumb
      Sentry.addBreadcrumb({
        category: 'console',
        message: args.map(String).join(' '),
        level: method === 'error' ? 'error' : method,
      });

      // Optionally send as event
      if (method === 'error' || method === 'warn') {
        Sentry.captureMessage(args.map(String).join(' '), method);
      }

      // Keep original behavior
      originalConsole[method](...args);
    };
  });
}

export default captureConsoleLogs;
