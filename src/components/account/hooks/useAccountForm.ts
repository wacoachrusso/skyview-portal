
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  id: string;
  [key: string]: any;
}

interface FormData {
  full_name: string;
  user_type: string;
  airline: string;
  employee_id: string;
  assistant_id: string;
  address: string;
  phone_number: string;
  [key: string]: string;
}

export const useAccountForm = (profile: ProfileData | null) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  const [hasSetAirlineAndJobRole, setHasSetAirlineAndJobRole] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: profile?.full_name || '',
    user_type: profile?.user_type || '',
    airline: profile?.airline || '',
    employee_id: profile?.employee_id || '',
    assistant_id: profile?.assistant_id || '',
    address: profile?.address || '',
    phone_number: profile?.phone_number || '',
  });

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!profile?.id) return;

      console.log('Checking alpha tester and promoter status for profile:', profile.id);

      const { data: alphaTester, error } = await supabase
        .from('alpha_testers')
        .select('temporary_password, is_promoter')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking user status:', error);
        return;
      }

      console.log('User status data:', alphaTester);

      if (alphaTester?.temporary_password || alphaTester?.is_promoter) {
        console.log('Setting password change as required');
        setIsPasswordChangeRequired(true);
        setIsEditing(true);
      }
    };

    checkUserStatus();
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.airline && profile?.user_type) {
      setHasSetAirlineAndJobRole(true);
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset airline if the job role changes to "Flight Attendant" and Delta Airlines is selected
    if (name === "user_type" && value === "Flight Attendant" && formData.airline === "Delta Airlines") {
      setFormData(prev => ({
        ...prev,
        airline: ""
      }));
    }
  };

  const isProfileComplete = () => {
    return formData.full_name &&
           formData.user_type &&
           formData.airline;
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('Form data:', formData);

    if (!isProfileComplete()) {
      console.log('Profile is not complete');
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: "Please fill out your full name, job title, and airline.",
      });
      return;
    }

    try {
      const { data: assistant, error: assistantError } = await supabase
        .from('openai_assistants')
        .select('assistant_id')
        .eq('airline', formData.airline.toLowerCase())
        .eq('work_group', formData.user_type.toLowerCase())
        .eq('is_active', true)
        .maybeSingle();

      console.log('Assistant lookup result:', { assistant, error: assistantError });

      if (assistantError) {
        console.error('Assistant lookup error:', assistantError);
        throw new Error('Error looking up assistant configuration. Please try again.');
      }

      if (!assistant) {
        console.log('No matching assistant found for:', {
          airline: formData.airline,
          jobTitle: formData.user_type,
        });
        throw new Error('We currently do not support your airline and role combination. Please contact support for assistance.');
      }

      console.log('Found matching assistant:', assistant);

      const updatedFormData = {
        ...formData,
        assistant_id: assistant.assistant_id,
      };

      console.log('Attempting to update profile with data:', updatedFormData);
      const { error } = await supabase
        .from('profiles')
        .update(updatedFormData)
        .eq('id', profile?.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log('Profile updated successfully');
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      setHasSetAirlineAndJobRole(true);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
      });
    }
  };

  return {
    isEditing,
    setIsEditing,
    isPasswordChangeRequired,
    hasSetAirlineAndJobRole,
    formData,
    handleInputChange,
    handleSelectChange,
    handleSubmit
  };
};
