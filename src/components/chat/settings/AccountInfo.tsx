import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/theme-provider";

export function AccountInfo() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [plan, setPlan] = useState<string>("Free Trial");
  const [queriesRemaining, setQueriesRemaining] = useState<number>(0);
  const { theme } = useTheme(); // You can still access this if needed

  useEffect(() => {
    const cachedProfile = sessionStorage.getItem("cached_user_profile");
    if (cachedProfile) {
      try {
        const profileData = JSON.parse(cachedProfile);
        setUserEmail(profileData.email || "");
        setPlan(profileData.subscription_plan || "Free Trial");

        if (profileData.subscription_plan === "free") {
          setQueriesRemaining(Math.max(0, 2 - (profileData.query_count || 0)));
        } else if (profileData.subscription_plan === "trial_ended") {
          setQueriesRemaining(0);
        } else {
          setQueriesRemaining(-1); // Unlimited
        }
      } catch (error) {
        console.error("Error parsing cached user profile:", error);
        fetchUserInfoFromAPI();
      }
    } else {
      fetchUserInfoFromAPI();
    }
  }, []);

  const fetchUserInfoFromAPI = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_plan, query_count")
          .eq("id", user.id)
          .single();

        if (profile) {
          setPlan(profile.subscription_plan || "Free Trial");
          if (profile.subscription_plan === "free") {
            setQueriesRemaining(Math.max(0, 2 - (profile.query_count || 0)));
          } else if (profile.subscription_plan === "trial_ended") {
            setQueriesRemaining(0);
          } else {
            setQueriesRemaining(-1);
          }

          sessionStorage.setItem(
            "cached_user_profile",
            JSON.stringify({ ...profile, email: user.email })
          );
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Account Information
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
          <span className="text-sm text-gray-900 dark:text-white">{userEmail}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
          <span className="text-sm text-gray-900 dark:text-white">{plan}</span>
        </div>
        <div className="hidden justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Queries Remaining</span>
          <span className="text-sm text-gray-900 dark:text-white">
            {queriesRemaining === -1 ? "Unlimited" : queriesRemaining}
          </span>
        </div>
      </div>
    </div>
  );
}
