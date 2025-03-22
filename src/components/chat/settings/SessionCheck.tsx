
import { useEffect } from "react";
import useSessionCheck from "@/hooks/session/useSessionCheck";

export function SessionCheck() {
  // The hook now contains all the session checking logic
  const sessionCheck = useSessionCheck();
  
  // This component is now just a wrapper around the hook
  return null;
}
