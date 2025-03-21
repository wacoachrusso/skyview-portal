
import { useState, useEffect } from "react";
import { updateSessionApiActivity } from "@/services/session";

/**
 * Hook to manage API call state and session activity
 */
export function useApiCallState() {
  // Set up and clear API call flags
  const setupApiCall = () => {
    const apiCallId = Date.now().toString();
    sessionStorage.setItem('api_call_in_progress', 'true');
    sessionStorage.setItem('api_call_id', apiCallId);
    console.log(`API call started with ID: ${apiCallId}`);
    return apiCallId;
  };

  const clearApiCall = (apiCallId: string) => {
    console.log(`API call with ID ${apiCallId} completed, clearing flag after delay`);
    
    setTimeout(() => {
      sessionStorage.removeItem('api_call_in_progress');
      sessionStorage.removeItem('api_call_id');
      console.log("API call flag cleared");
    }, 500);
  };

  // Update session activity to prevent timeout during API calls
  const updateSessionActivity = async () => {
    const currentToken = localStorage.getItem('session_token');
    if (currentToken) {
      await updateSessionApiActivity(currentToken);
    }
  };

  return {
    setupApiCall,
    clearApiCall,
    updateSessionActivity
  };
}
