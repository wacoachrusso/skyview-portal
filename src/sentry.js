// src/sentry.js
import * as Sentry from "@sentry/react";
import { v4 as uuidv4 } from "uuid";

// const getSessionUUID = () => {
//   let sessionUUID = sessionStorage.getItem("sessionUUID");
//   if (!sessionUUID) {
//     sessionUUID = uuidv4();
//     sessionStorage.setItem("sessionUUID", sessionUUID);
//   }
//   return sessionUUID;
// };

// export const initSentry = () => {
//   const sessionUUID = getSessionUUID();

//   Sentry.init({
//     dsn: "https://729c94a21a0f8f3e917191f8bcbc3efa@o4509667837280256.ingest.de.sentry.io/4509667841867856", // Use .env for DSN
//     integrations: [new BrowserTracing()],
//     tracesSampleRate: 1.0,
//     initialScope: (scope) => {
//       scope.setTag("session_uuid", sessionUUID);
//       return scope;
//     },
//   });
// };
Sentry.init({
  dsn: 'https://729c94a21a0f8f3e917191f8bcbc3efa@o4509667837280256.ingest.de.sentry.io/4509667841867856',
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  beforeBreadcrumb(breadcrumb, hint) {
    // Optional: filter out some console logs
    return breadcrumb;
  }
});