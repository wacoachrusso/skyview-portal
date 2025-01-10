import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthCallback } from "@/components/auth/AuthCallback";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import "./App.css";

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

// Lazy load components with retry
const Index = lazy(() => retryLoadComponent(() => import("@/pages/Index")));
const Login = lazy(() => retryLoadComponent(() => import("@/pages/Login")));
const SignUp = lazy(() => retryLoadComponent(() => import("@/pages/SignUp")));
const Chat = lazy(() => retryLoadComponent(() => import("@/pages/Chat")));
const Account = lazy(() => retryLoadComponent(() => import("@/pages/Account")));
const Settings = lazy(() => retryLoadComponent(() => import("@/pages/Settings")));
const Dashboard = lazy(() => retryLoadComponent(() => import("@/pages/Dashboard")));
const AdminDashboard = lazy(() => retryLoadComponent(() => import("@/pages/AdminDashboard")));
const About = lazy(() => retryLoadComponent(() => import("@/pages/About")));
const ReleaseNotes = lazy(() => retryLoadComponent(() => import("@/pages/ReleaseNotes")));
const PrivacyPolicy = lazy(() => retryLoadComponent(() => import("@/pages/PrivacyPolicy")));
const Refunds = lazy(() => retryLoadComponent(() => import("@/pages/Refunds")));
const ForgotPassword = lazy(() => retryLoadComponent(() => import("@/pages/ForgotPassword")));
const ResetPassword = lazy(() => retryLoadComponent(() => import("@/pages/ResetPassword")));

// Create a client with optimized options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/privacy-policy",
  "/about",
  "/forgot-password",
  "/reset-password"
];

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<About />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Protected routes */}
              <Route path="/chat" element={<Chat />} />
              <Route path="/account" element={<Account />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/release-notes" element={<ReleaseNotes />} />
              <Route path="/refunds" element={<Refunds />} />
            </Routes>
          </Suspense>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;