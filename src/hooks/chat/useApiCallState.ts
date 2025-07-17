import { useState, useEffect } from "react";
import { updateSessionApiActivity } from "@/services/session";
import { useSessionStore } from "@/stores/session";

/**
 * Hook to manage API call state and session activity
 */
export function useApiCallState() {
  const store = useSessionStore();
  
  // Set up and clear API call flags
  const setupApiCall = () => {
    const apiCallId = Date.now().toString();
    store.setApiCallInProgress(true);
    console.log(`API call started with ID: ${apiCallId}`);
    return apiCallId;
  };

  const clearApiCall = (apiCallId: string) => {
    console.log(`API call with ID ${apiCallId} completed, clearing flag after delay`);
    
    setTimeout(() => {
      store.setApiCallInProgress(false);
      console.log("API call flag cleared");
    }, 500);
  };

  // Update session activity to prevent timeout during API calls
  const updateSessionActivity = async () => {
    const currentToken = store.sessionToken;
    if (currentToken) {
      await updateSessionApiActivity(currentToken);
    }
  };

  return {
    setupApiCall,
    clearApiCall,
    updateSessionActivity,
    apiCallInProgress: store.apiCallInProgress
  };
}