
import { lazy } from "react";

// Lazily load components with consistent naming pattern
export const Index = lazy(() => import("@/pages/Index"));
export const Login = lazy(() => import("@/pages/Login"));
export const SignUp = lazy(() => import("@/pages/SignUp"));
export const Chat = lazy(() => import("@/components/deprecated/Chat"));
export const Account = lazy(() => import("@/pages/Account"));
export const Settings = lazy(() => import("@/pages/Settings"));
export const Dashboard = lazy(() => import("@/pages/Dashboard"));
export const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
export const About = lazy(() => import("@/pages/About"));
export const ReleaseNotes = lazy(() => import("@/pages/ReleaseNotes"));
export const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
export const Refunds = lazy(() => import("@/pages/Refunds"));
export const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
export const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
export const HelpCenter = lazy(() => import("@/pages/HelpCenter"));
