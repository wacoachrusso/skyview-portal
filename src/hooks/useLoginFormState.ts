import { useState } from "react";

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const useLoginFormState = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false
  });

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      rememberMe: false
    });
    setLoading(false);
  };

  return {
    loading,
    setLoading,
    showPassword,
    setShowPassword,
    formData,
    setFormData,
    resetForm
  };
};