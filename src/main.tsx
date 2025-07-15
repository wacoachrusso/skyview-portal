import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import "./sentry.js";
import captureConsoleLogs from './utils/sentryConsoleCapture';
captureConsoleLogs();

createRoot(document.getElementById("root")!).render(<App />);
