import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SessionState {
  // Session data
  sessionToken: string | null;
  userId: string | null;
  userEmail: string | null;
  
  // Auth tokens
  accessToken: string | null;
  refreshToken: string | null;
  
  // User status flags
  isAdmin: boolean;
  isNewUserSignup: boolean;
  recentlySignedUp: boolean;
  
  // Payment and subscription flags
  paymentInProgress: boolean;
  postPaymentConfirmation: boolean;
  subscriptionActivated: boolean;
  
  // Navigation flags
  skipInitialRedirect: boolean;
  redirectToPricing: boolean;
  
  // API call state
  apiCallInProgress: boolean;
  
  // Actions
  setSessionToken: (token: string | null) => void;
  setUserId: (id: string | null) => void;
  setUserEmail: (email: string | null) => void;
  setAuthTokens: (access: string | null, refresh: string | null) => void;
  setIsAdmin: (admin: boolean) => void;
  setIsNewUserSignup: (isNew: boolean) => void;
  setRecentlySignedUp: (recent: boolean) => void;
  setPaymentInProgress: (inProgress: boolean) => void;
  setPostPaymentConfirmation: (confirmed: boolean) => void;
  setSubscriptionActivated: (activated: boolean) => void;
  setSkipInitialRedirect: (skip: boolean) => void;
  setRedirectToPricing: (redirect: boolean) => void;
  setApiCallInProgress: (inProgress: boolean) => void;
  
  // Utility actions
  clearSession: () => void;
  clearPaymentFlags: () => void;
  clearAllFlags: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionToken: null,
      userId: null,
      userEmail: null,
      accessToken: null,
      refreshToken: null,
      isAdmin: false,
      isNewUserSignup: false,
      recentlySignedUp: false,
      paymentInProgress: false,
      postPaymentConfirmation: false,
      subscriptionActivated: false,
      skipInitialRedirect: false,
      redirectToPricing: false,
      apiCallInProgress: false,
      
      // Actions
      setSessionToken: (token) => set({ sessionToken: token }),
      setUserId: (id) => set({ userId: id }),
      setUserEmail: (email) => set({ userEmail: email }),
      setAuthTokens: (access, refresh) => set({ 
        accessToken: access, 
        refreshToken: refresh 
      }),
      setIsAdmin: (admin) => set({ isAdmin: admin }),
      setIsNewUserSignup: (isNew) => set({ isNewUserSignup: isNew }),
      setRecentlySignedUp: (recent) => set({ recentlySignedUp: recent }),
      setPaymentInProgress: (inProgress) => set({ paymentInProgress: inProgress }),
      setPostPaymentConfirmation: (confirmed) => set({ postPaymentConfirmation: confirmed }),
      setSubscriptionActivated: (activated) => set({ subscriptionActivated: activated }),
      setSkipInitialRedirect: (skip) => set({ skipInitialRedirect: skip }),
      setRedirectToPricing: (redirect) => set({ redirectToPricing: redirect }),
      setApiCallInProgress: (inProgress) => set({ apiCallInProgress: inProgress }),
      
      // Utility actions
      clearSession: () => set({
        sessionToken: null,
        userId: null,
        userEmail: null,
        accessToken: null,
        refreshToken: null,
        isAdmin: false,
      }),
      
      clearPaymentFlags: () => set({
        paymentInProgress: false,
        postPaymentConfirmation: false,
        subscriptionActivated: false,
      }),
      
      clearAllFlags: () => set({
        isNewUserSignup: false,
        recentlySignedUp: false,
        paymentInProgress: false,
        postPaymentConfirmation: false,
        subscriptionActivated: false,
        skipInitialRedirect: false,
        redirectToPricing: false,
        apiCallInProgress: false,
      }),
    }),
    {
      name: 'session-store',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for security
      partialize: (state) => ({
        // Only persist certain fields, exclude sensitive data
        sessionToken: state.sessionToken,
        userId: state.userId,
        userEmail: state.userEmail,
        isAdmin: state.isAdmin,
        // Don't persist tokens for security
        // Don't persist temporary flags
      }),
    }
  )
);