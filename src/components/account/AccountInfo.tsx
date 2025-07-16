import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AccountInfoCard } from "./profile/AccountInfoCard";
import { PasswordChangeCard } from "./password/PasswordChangeCard";
import { useAccountForm } from "./hooks/useAccountForm";

interface AccountInfoProps {
  userEmail: string | null;
  profile: any;
  showPasswordChange?: boolean;
}

export const AccountInfo = ({ 
  userEmail, 
  profile, 
  showPasswordChange = true 
}: AccountInfoProps) => {
  const [localProfile, setLocalProfile] = useState(profile);

  // Update local profile when prop changes
  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const handleProfileUpdate = (updatedProfile: any) => {
    setLocalProfile(updatedProfile);
  };

  const {
    isEditing,
    setIsEditing,
    isPasswordChangeRequired,
    hasSetAirlineAndJobRole,
    formData,
    handleInputChange,
    handleSubmit
  } = useAccountForm(localProfile, handleProfileUpdate);

  return (
    <div className="space-y-6">
      {/* Account Information Card */}
      <AccountInfoCard 
        isEditing={isEditing}
        formData={formData}
        handleInputChange={handleInputChange}
        profile={localProfile}
        hasSetAirlineAndJobRole={hasSetAirlineAndJobRole}
        onSave={handleSubmit}
        onEdit={() => setIsEditing(true)}
      />

      {/* Change Password Card */}
      {showPasswordChange && (
        <PasswordChangeCard 
          isPasswordChangeRequired={isPasswordChangeRequired}
        />
      )}
    </div>
  );
};