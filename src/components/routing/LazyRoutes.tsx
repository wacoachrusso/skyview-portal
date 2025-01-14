import { lazy } from "react";

// Retry logic for lazy loading components
const retryLoadComponent = (fn: () => Promise<any>, retriesLeft = 3): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        console.warn(`Error loading component, retries left: ${retriesLeft}`, error);
        if (retriesLeft === 0) {
          reject(error);
          return;
        }
        setTimeout(() => {
          retryLoadComponent(fn, retriesLeft - 1).then(resolve, reject);
        }, 1500);
      });
  });
};

// Enhanced lazy loading with better error handling and logging
const enhancedLazy = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() => {
    console.log(`Loading ${componentName} component`);
    return retryLoadComponent(() => 
      importFn().catch(error => {
        console.error(`Failed to load ${componentName}:`, error);
        throw error;
      })
    );
  });
};

// Lazy load components with enhanced logging
export const Index = enhancedLazy(() => import("@/pages/Index"), "Index");
export const Login = enhancedLazy(() => import("@/pages/Login"), "Login");
export const SignUp = enhancedLazy(() => import("@/pages/SignUp"), "SignUp");
export const Chat = enhancedLazy(() => import("@/pages/Chat"), "Chat");
export const Account = enhancedLazy(() => import("@/pages/Account"), "Account");
export const Settings = enhancedLazy(() => import("@/pages/Settings"), "Settings");
export const AdminDashboard = enhancedLazy(() => import("@/pages/AdminDashboard"), "AdminDashboard");
export const About = enhancedLazy(() => import("@/pages/About"), "About");
export const ReleaseNotes = enhancedLazy(() => import("@/pages/ReleaseNotes"), "ReleaseNotes");
export const PrivacyPolicy = enhancedLazy(() => import("@/pages/PrivacyPolicy"), "PrivacyPolicy");
export const Refunds = enhancedLazy(() => import("@/pages/Refunds"), "Refunds");
export const ForgotPassword = enhancedLazy(() => import("@/pages/ForgotPassword"), "ForgotPassword");
export const ResetPassword = enhancedLazy(() => import("@/pages/ResetPassword"), "ResetPassword");
export const HelpCenter = enhancedLazy(() => import("@/pages/HelpCenter"), "HelpCenter");
export const Dashboard = enhancedLazy(() => import("@/pages/Dashboard"), "Dashboard");