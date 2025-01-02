import { useEffect } from "react";
import { useAuthCallback } from "@/hooks/useAuthCallback";

export function AuthCallback() {
  const { handleCallback } = useAuthCallback();

  useEffect(() => {
    handleCallback();
  }, []);

  return null;
}