import { Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Account from "@/pages/Account";
import Settings from "@/pages/Settings";
import AdminDashboard from "@/pages/AdminDashboard";
import AuthCallback from "@/components/auth/AuthCallback";
import About from "@/pages/About";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Refunds from "@/pages/Refunds";
import ReleaseNotes from "@/pages/ReleaseNotes";
import HelpCenter from "@/pages/HelpCenter";
import Referrals from "@/pages/Referrals";
import { NavigationProvider } from "./NavigationProvider";
import { ProfileProvider } from "../utils/ProfileProvider";
import Chat from "@/pages/Chat";
import { ProtectedRoute } from "@/components/routing/ProtectedRoutes";
import { AuthSuccessHandler } from "@/components/auth/AuthSuccessHandler";

export function AppRoutes() {
  return (
    <NavigationProvider>
      <ProfileProvider>
        {/* Auth Success Handler - Runs on every route to handle payment/auth success redirects */}
        <AuthSuccessHandler />
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route 
            path="/login" 
            element={
              <ProtectedRoute redirectAuthenticatedTo="/chat">
                <Login />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <ProtectedRoute redirectAuthenticatedTo="/chat">
                <SignUp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <ProtectedRoute redirectAuthenticatedTo="/chat">
                <ForgotPassword />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <ProtectedRoute redirectAuthenticatedTo="/chat">
                <ResetPassword />
              </ProtectedRoute>
            } 
          />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/release-notes" element={<ReleaseNotes />} />
          <Route path="/help" element={<HelpCenter />} />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireAuth>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute requireAuth>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute requireAuth>
                <Chat/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute requireAuth>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAuth>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/referrals" 
            element={
              <ProtectedRoute requireAuth>
                <Referrals />
              </ProtectedRoute>
            } 
          />

          {/* Auth callback routes */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProfileProvider>
    </NavigationProvider>
  );
}