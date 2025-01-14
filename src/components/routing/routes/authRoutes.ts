import { enhancedLazy, retryLoadComponent } from "../utils/lazyLoadUtils";

export const Login = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/Login")), "Login");

export const SignUp = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/SignUp")), "SignUp");

export const ForgotPassword = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/ForgotPassword")), "ForgotPassword");

export const ResetPassword = enhancedLazy(() => 
  retryLoadComponent(() => import("@/pages/ResetPassword")), "ResetPassword");