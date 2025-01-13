import * as Sentry from "@sentry/react";

export const trackError = (error: Error, context?: Record<string, any>) => {
  console.error('Error occurred:', error);
  
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    // Add the current route as context
    scope.setTag('route', window.location.pathname);
    
    Sentry.captureException(error);
  });
};

export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  console.log(`Event tracked: ${eventName}`, data);
  
  Sentry.addBreadcrumb({
    category: 'app-event',
    message: eventName,
    level: 'info',
    data,
  });
};