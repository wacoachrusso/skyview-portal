// src/sentry.js
import * as Sentry from "@sentry/react";
import { v4 as uuidv4 } from "uuid";

const getSessionUUID = () => {
  let sessionUUID = sessionStorage.getItem("sessionUUID");
  if (!sessionUUID) {
    sessionUUID = uuidv4();
    sessionStorage.setItem("sessionUUID", sessionUUID);
  }
  return sessionUUID;
};

export const initSentry = () => {
  const sessionUUID = getSessionUUID();

  Sentry.init({
    dsn: import.meta.env.VITE__SENTRY_DSN_KEY, // Use .env for DSN
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
    initialScope: (scope) => {
      scope.setTag("session_uuid", sessionUUID);
      return scope;
    },
    beforeBreadcrumb(breadcrumb, hint) {
      // Optional: filter out some console logs
      return breadcrumb;
    }
  });
};