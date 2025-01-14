import { enhancedLazy, retryLoadComponent } from "../utils/lazyLoadUtils";

export const Index = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/Index")), "Index");

export const About = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/About")), "About");

export const PrivacyPolicy = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/PrivacyPolicy")), "PrivacyPolicy");

export const HelpCenter = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/HelpCenter")), "HelpCenter");

export const NotFound = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/NotFound")), "NotFound");