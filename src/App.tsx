import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthCallback } from "@/components/auth/AuthCallback";
import "./App.css";

// Lazy load route components
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/Login"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const Chat = lazy(() => import("@/pages/Chat"));
const Account = lazy(() => import("@/pages/Account"));
const Settings = lazy(() => import("@/pages/Settings"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const About = lazy(() => import("@/pages/About"));
const ReleaseNotes = lazy(() => import("@/pages/ReleaseNotes"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Refunds = lazy(() => import("@/pages/Refunds"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/privacy-policy",
  "/about",
  "/auth/callback",
  "/forgot-password",
  "/reset-password"
];

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

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