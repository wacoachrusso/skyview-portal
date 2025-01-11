import { lazy } from "react";

// Retry logic for lazy loading components
const retryLoadComponent = (fn: () => Promise<any>, retriesLeft = 3): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        console.warn(`Error loading component, retries left: ${retriesLeft}`, error);
        if (retriesLeft === 0) {
          console.error('Failed to load component after all retries:', error);
          reject(error);
          return;
        }
        setTimeout(() => {
          retryLoadComponent(fn, retriesLeft - 1).then(resolve, reject);
        }, 1500);
      });
  });
};

// Lazy load components with retry
export const Index = lazy(() => {
  console.log('Loading Index component');
  return retryLoadComponent(() => import("@/pages/Index"));
});

export const Login = lazy(() => {
  console.log('Loading Login component');
  return retryLoadComponent(() => import("@/pages/Login"));
});

export const SignUp = lazy(() => retryLoadComponent(() => import("@/pages/SignUp")));
export const Chat = lazy(() => retryLoadComponent(() => import("@/pages/Chat")));
export const Account = lazy(() => retryLoadComponent(() => import("@/pages/Account")));
export const Settings = lazy(() => retryLoadComponent(() => import("@/pages/Settings")));
export const Dashboard = lazy(() => retryLoadComponent(() => import("@/pages/Dashboard")));
export const AdminDashboard = lazy(() => {
  console.log('Loading AdminDashboard component');
  return retryLoadComponent(() => import("@/pages/AdminDashboard"))
    .catch(error => {
      console.error('Failed to load AdminDashboard:', error);
      throw error;
    });
});
export const About = lazy(() => retryLoadComponent(() => import("@/pages/About")));
export const ReleaseNotes = lazy(() => retryLoadComponent(() => import("@/pages/ReleaseNotes")));
export const PrivacyPolicy = lazy(() => retryLoadComponent(() => import("@/pages/PrivacyPolicy")));
export const Refunds = lazy(() => retryLoadComponent(() => import("@/pages/Refunds")));
export const ForgotPassword = lazy(() => retryLoadComponent(() => import("@/pages/ForgotPassword")));
export const ResetPassword = lazy(() => retryLoadComponent(() => import("@/pages/ResetPassword")));
export const HelpCenter = lazy(() => retryLoadComponent(() => import("@/pages/HelpCenter")));