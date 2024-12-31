import { useState } from "react";

export const useSignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    jobTitle: "",
    airline: "",
  });

  return {
    formData,
    setFormData,
    showPassword,
    setShowPassword,
    passwordError,
    setPasswordError,
  };
};