
import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserDetailsDialogProps {
  user: ProfilesRow | null;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export const UserDetailsDialog = ({ user, onClose, onUserUpdated }: UserDetailsDialogProps) => {
  const { toast } = useToast();
  const [airline, setAirline] = useState(user?.airline || "");
  const [userType, setUserType] = useState(user?.user_type || "");
  const [isUpdating, setIsUpdating] = useState(false);
  
  if (!user) return null;

  const handleUpdate = async () => {
    if (!user.id) return;
    
    try {
      setIsUpdating(true);
      
      // Update the user's airline and user_type (workgroup)
      const { error } = await supabase
        .from("profiles")
        .update({ 
          airline: airline.trim() || null,
          user_type: userType.trim() || null,
        })
        .eq("id", user.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User information updated successfully",
      });
      
      if (onUserUpdated) {
        onUserUpdated();
      }
      
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user information",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Only offering user types supported by OpenAI assistants
  const userTypeOptions = [
    { value: "pilot", label: "Pilot" },
    { value: "flight_attendant", label: "Flight Attendant" },
  ];

  // Only offering airlines supported by OpenAI assistants
  const airlineOptions = [
    { value: "american", label: "American Airlines" },
    { value: "delta", label: "Delta Air Lines" },
    { value: "united", label: "United Airlines" },
    { value: "southwest", label: "Southwest Airlines" },
    { value: "jetblue", label: "JetBlue Airways" },
    { value: "alaska", label: "Alaska Airlines" },
    { value: "spirit", label: "Spirit Airlines" },
    { value: "frontier", label: "Frontier Airlines" },
    { value: "hawaiian", label: "Hawaiian Airlines" },
    { value: "allegiant", label: "Allegiant Air" },
  ];

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Full Name:</div>
            <div className="col-span-3">{user.full_name || "N/A"}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Email:</div>
            <div className="col-span-3">{user.email || "N/A"}</div>
          </div>
          
          {/* Editable User Type / Workgroup - Only showing supported options */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user-type" className="font-medium">User Type:</Label>
            <div className="col-span-3">
              <Select 
                value={userType || ""} 
                onValueChange={setUserType}
              >
                <SelectTrigger id="user-type" className="w-full">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  {userTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Editable Airline - Only showing supported options */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="airline" className="font-medium">Airline:</Label>
            <div className="col-span-3">
              <Select 
                value={airline || ""} 
                onValueChange={setAirline}
              >
                <SelectTrigger id="airline" className="w-full">
                  <SelectValue placeholder="Select airline" />
                </SelectTrigger>
                <SelectContent>
                  {airlineOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Plan:</div>
            <div className="col-span-3">
              {user.subscription_plan || "N/A"}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Queries:</div>
            <div className="col-span-3">{user.query_count || 0}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Last Query:</div>
            <div className="col-span-3">
              {user.last_query_timestamp
                ? format(
                    new Date(user.last_query_timestamp),
                    "MMM d, yyyy HH:mm"
                  )
                : "N/A"}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Last IP:</div>
            <div className="col-span-3">
              {user.last_ip_address || "N/A"}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Status:</div>
            <div className="col-span-3">
              {user.account_status || "active"}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
