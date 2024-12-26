import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AccountInfo() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [plan, setPlan] = useState<string>("Free Trial");
  const [queriesRemaining, setQueriesRemaining] = useState<number>(0);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || "");
          
          // Fetch user profile information
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_plan, query_count')
            .eq('id', user.id)
            .single();
            
          if (profile) {
            setPlan(profile.subscription_plan || "Free Trial");
            // Assuming a free trial has 10 queries
            setQueriesRemaining(10 - (profile.query_count || 0));
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Account Information</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Email</span>
          <span className="text-sm text-white">{userEmail}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Plan</span>
          <span className="text-sm text-white">{plan}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Queries Remaining</span>
          <span className="text-sm text-white">{queriesRemaining}</span>
        </div>
      </div>
    </div>
  );
}