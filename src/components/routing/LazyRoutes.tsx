import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// Wrapper component for lazy-loaded routes with loading state
const LazyLoadWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense 
    fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all">
        <LoadingSpinner size="lg" className="h-12 w-12" />
      </div>
    }
  >
    {children}
  </Suspense>
);

// Enhanced lazy loading with better error handling and logging
const enhancedLazy = (
  importFn: () => Promise<any>,
  componentName: string
) => {
  console.log(`Starting lazy load for ${componentName}`);
  
  return lazy(() =>
    importFn()
      .then(module => {
        console.log(`Successfully loaded ${componentName}`);
        return module;
      })
      .catch(error => {
        console.error(`Error loading ${componentName}:`, error);
        throw error;
      })
  );
};

// Lazy load route components with retry logic
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

// Lazy loaded components with enhanced error handling
export const Index = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/Index")), "Index");

export const Login = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/Login")), "Login");

export const SignUp = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/SignUp")), "SignUp");

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

export const About = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/About")), "About");

export const ReleaseNotes = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/ReleaseNotes")), "ReleaseNotes");

export const PrivacyPolicy = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/PrivacyPolicy")), "PrivacyPolicy");

export const Refunds = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/Refunds")), "Refunds");

export const ForgotPassword = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/ForgotPassword")), "ForgotPassword");

export const ResetPassword = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/ResetPassword")), "ResetPassword");

export const HelpCenter = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/HelpCenter")), "HelpCenter");

// Export the wrapper for use in route configuration
export { LazyLoadWrapper };