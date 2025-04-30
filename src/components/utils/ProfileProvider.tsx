import React, { createContext, useContext, useState, useEffect } from "react";
import { useProfileLoader } from "@/hooks/account-management/useProfileLoader";
import { Profile } from "@/hooks/account-management/types";
import { User } from "@supabase/supabase-js";

interface ProfileContextType {
  isProfileLoading: boolean;
  profileLoadError: string | null;
  userEmail: string | null;
  profile: Profile | null;
  authUser: User | null;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isLoading: isProfileLoading,
    loadError: profileLoadError,
    userEmail,
    profile,
    authUser,
    retryLoading: refreshProfile
  } = useProfileLoader();

  useEffect(() => {
    if (profile) {
      console.log("Global profile loaded:", profile.id);
    }
  }, [profile]);

  return (
    <ProfileContext.Provider
      value={{
        isProfileLoading,
        profileLoadError,
        userEmail,
        profile,
        authUser,
        refreshProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};