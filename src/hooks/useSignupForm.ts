import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SignupFormData {
  email: string;
  password: string;
  fullName: string;
  jobTitle: string;
  airline: string;
}

export const useSignupForm = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    fullName: "",
    jobTitle: "",
    airline: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // No prefill logic for Google users
  return {
    formData,
    setFormData,
    showPassword,
    setShowPassword,
    passwordError,
    setPasswordError,
  };
};