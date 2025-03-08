
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReleaseNotesAdmin } from "@/components/admin/ReleaseNotesAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemStats } from "@/components/admin/SystemStats";
import { NotificationManager } from "@/components/admin/NotificationManager";
import { AlphaTesters } from "@/components/admin/AlphaTesters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirmAdminAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (error || !profile?.is_admin) {
          console.log("Admin check failed:", error || "User is not an admin");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error confirming admin access:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    confirmAdminAccess();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // The AdminRoute component will handle this case
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
