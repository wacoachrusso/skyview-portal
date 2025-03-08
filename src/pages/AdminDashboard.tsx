
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ReleaseNotesAdmin } from "@/components/admin/ReleaseNotesAdmin";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemStats } from "@/components/admin/SystemStats";
import { NotificationManager } from "@/components/admin/NotificationManager";
import { AlphaTesters } from "@/components/admin/AlphaTesters";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        console.log("Checking admin access...");

        // Fetch session data
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          toast({ variant: "destructive", title: "Session Error", description: "Could not verify session." });
          navigate("/login");
          return;
        }

        if (!session) {
          console.warn("No session found, redirecting to login...");
          navigate("/login");
          return;
        }

        console.log("Session Data:", session);

        // Fetch fresh user admin status directly from the database
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          toast({ variant: "destructive", title: "Profile Error", description: "Could not verify admin status." });
          navigate("/login");
          return;
        }

        console.log("Admin Check Result:", profile);

        // Double check admin status
        if (!profile?.is_admin) {
          console.warn("User is NOT an admin! Profile data:", profile);
          toast({ 
            variant: "destructive", 
            title: "Access Denied", 
            description: "You don't have permission to access the admin dashboard." 
          });

          setTimeout(() => navigate("/dashboard"), 3000);
          return;
        }

        console.log("✅ Admin access granted!");
        setIsAdmin(true);
      } catch (error) {
        console.error("Unexpected error checking admin access:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-xl">
        Access Denied. Redirecting...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
          <LayoutDashboard className="h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="alpha-testers">Alpha Testers</TabsTrigger>
          <TabsTrigger value="release-notes">Release Notes</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><SystemStats /></TabsContent>
        <TabsContent value="users"><UserManagement /></TabsContent>
        <TabsContent value="alpha-testers"><AlphaTesters /></TabsContent>
        <TabsContent value="release-notes"><ReleaseNotesAdmin /></TabsContent>
        <TabsContent value="notifications"><NotificationManager /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
