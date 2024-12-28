import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Chat from "@/pages/Chat";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import CompleteProfile from "@/pages/CompleteProfile";
import AdminDashboard from "@/pages/AdminDashboard";
import ReleaseNotes from "@/pages/ReleaseNotes";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/release-notes" element={<ReleaseNotes />} />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;