import { enhancedLazy, retryLoadComponent } from "../utils/lazyLoadUtils";

export const Chat = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/Chat")), "Chat");

export const Account = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/Account")), "Account");

export const Settings = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/Settings")), "Settings");

export const Dashboard = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/Dashboard")), "Dashboard");

export const AdminDashboard = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/AdminDashboard")), "AdminDashboard");

export const ReleaseNotes = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/ReleaseNotes")), "ReleaseNotes");

export const Refunds = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/Refunds")), "Refunds");