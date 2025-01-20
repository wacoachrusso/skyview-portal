import { lazy } from "react";

// Retry logic for lazy loading components
const retryLoadComponent = (fn: () => Promise<any>, retriesLeft = 3, interval = 1500): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        console.warn(`Error loading component, retries left: ${retriesLeft}`, error);
        if (retriesLeft === 0) {
          console.error('Component failed to load after all retries', error);
          reject(error);
          return;
        }
        setTimeout(() => {
          retryLoadComponent(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
};

// Lazy load components with retry and logging
export const Index = lazy(() => {
  console.log('Loading Index component');
  return retryLoadComponent(() => import("@/pages/Index"));
});

export const Login = lazy(() => {
  console.log('Loading Login component');
  return retryLoadComponent(() => import("@/pages/Login"));
});

export const SignUp = lazy(() => {
  console.log('Loading SignUp component');
  return retryLoadComponent(() => import("@/pages/SignUp"));
});

export const Chat = lazy(() => {
  console.log('Loading Chat component');
  return retryLoadComponent(() => import("@/pages/Chat"));
});

export const Account = lazy(() => {
  console.log('Loading Account component');
  return retryLoadComponent(() => import("@/pages/Account"));
});

export const Settings = lazy(() => {
  console.log('Loading Settings component');
  return retryLoadComponent(() => import("@/pages/Settings"));
});

export const Dashboard = lazy(() => {
  console.log('Loading Dashboard component');
  return retryLoadComponent(() => import("@/pages/Dashboard"));
});

export const AdminDashboard = lazy(() => {
  console.log('Loading AdminDashboard component');
  return retryLoadComponent(() => import("@/pages/AdminDashboard"));
});

export const About = lazy(() => {
  console.log('Loading About component');
  return retryLoadComponent(() => import("@/pages/About"));
});

export const ReleaseNotes = lazy(() => {
  console.log('Loading ReleaseNotes component');
  return retryLoadComponent(() => import("@/pages/ReleaseNotes"));
});

export const PrivacyPolicy = lazy(() => {
  console.log('Loading PrivacyPolicy component');
  return retryLoadComponent(() => import("@/pages/PrivacyPolicy"));
});

export const Refunds = lazy(() => {
  console.log('Loading Refunds component');
  return retryLoadComponent(() => import("@/pages/Refunds"));
});

export const ForgotPassword = lazy(() => {
  console.log('Loading ForgotPassword component');
  return retryLoadComponent(() => import("@/pages/ForgotPassword"));
});

export const ResetPassword = lazy(() => {
  console.log('Loading ResetPassword component');
  return retryLoadComponent(() => import("@/pages/ResetPassword"));
});

export const HelpCenter = lazy(() => {
  console.log('Loading HelpCenter component');
  return retryLoadComponent(() => import("@/pages/HelpCenter"));
});