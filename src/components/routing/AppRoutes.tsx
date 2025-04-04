
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Account from "@/pages/Account";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import AdminDashboard from "@/pages/AdminDashboard";
import AuthCallback from "@/components/auth/AuthCallback";
import About from "@/pages/About";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Refunds from "@/pages/Refunds";
import ReleaseNotes from "@/pages/ReleaseNotes";
import HelpCenter from "@/pages/HelpCenter";
import Referrals from "@/pages/Referrals";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/refunds" element={<Refunds />} />
      <Route path="/release-notes" element={<ReleaseNotes />} />
      <Route path="/help" element={<HelpCenter />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/account" element={<Account />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/referrals" element={<Referrals />} />
      
      {/* Auth callback routes */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
