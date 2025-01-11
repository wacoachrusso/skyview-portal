import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AccountInfoProps {
  userEmail: string | null;
  profile: any;
}

export const AccountInfo = ({ userEmail, profile }: AccountInfoProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    user_type: profile?.user_type || '',
    airline: profile?.airline || '',
    address: profile?.address || '',
    phone_number: profile?.phone_number || '',
    employee_id: profile?.employee_id || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

  return (
    <Card className="bg-white/95 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-brand-navy">Account Information</CardTitle>
        <Button
          variant="outline"
          onClick={() => {
            if (isEditing) {
              handleSubmit();
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">Email:</span>
            <span className="col-span-2 text-gray-700">{userEmail}</span>
          </div>
          
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">Full Name:</span>
            {isEditing ? (
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="col-span-2"
              />
            ) : (
              <span className="col-span-2 text-gray-700">{profile?.full_name || 'Not set'}</span>
            )}
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">User Type:</span>
            {isEditing ? (
              <Input
                name="user_type"
                value={formData.user_type}
                onChange={handleInputChange}
                className="col-span-2"
              />
            ) : (
              <span className="col-span-2 text-gray-700">{profile?.user_type || 'Not set'}</span>
            )}
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">Airline:</span>
            {isEditing ? (
              <Input
                name="airline"
                value={formData.airline}
                onChange={handleInputChange}
                className="col-span-2"
              />
            ) : (
              <span className="col-span-2 text-gray-700">{profile?.airline || 'Not set'}</span>
            )}
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">Address:</span>
            {isEditing ? (
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="col-span-2"
                placeholder="Optional"
              />
            ) : (
              <span className="col-span-2 text-gray-700">{profile?.address || 'Not set'}</span>
            )}
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">Phone Number:</span>
            {isEditing ? (
              <Input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="col-span-2"
                placeholder="Optional"
              />
            ) : (
              <span className="col-span-2 text-gray-700">{profile?.phone_number || 'Not set'}</span>
            )}
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">Employee ID:</span>
            {isEditing ? (
              <Input
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                className="col-span-2"
                placeholder="Optional"
              />
            ) : (
              <span className="col-span-2 text-gray-700">{profile?.employee_id || 'Not set'}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};