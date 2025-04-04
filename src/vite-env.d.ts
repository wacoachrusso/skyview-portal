/// <reference types="vite/client" />

interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface NotificationOptions {
  body?: string;
  tag?: string;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  timestamp?: number;
  data?: any;
  renotify?: boolean;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  silent?: boolean;
  sound?: string;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface Navigator {
  setAppBadge?: (count: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
  msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
}