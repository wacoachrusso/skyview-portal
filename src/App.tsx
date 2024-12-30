import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import Account from "@/pages/Account";
import CompleteProfile from "@/pages/CompleteProfile";
import { AuthCallback } from "@/components/auth/AuthCallback";
import ReleaseNotes from "@/pages/ReleaseNotes";
import AdminDashboard from "@/pages/AdminDashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ResetPassword from "@/pages/ResetPassword";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account" element={<Account />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/release-notes" element={<ReleaseNotes />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;