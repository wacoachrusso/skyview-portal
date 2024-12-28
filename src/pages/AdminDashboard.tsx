import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ReleaseNotesAdmin } from "@/components/admin/ReleaseNotesAdmin";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemStats } from "@/components/admin/SystemStats";
import { NotificationManager } from "@/components/admin/NotificationManager";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        console.log('Checking admin access...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session found, redirecting to login');
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        console.log('Admin check result:', profile);

        if (!profile?.is_admin) {
          console.log('User is not an admin, redirecting to dashboard');
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard."
          });
          navigate('/dashboard');
          return;
        }

        console.log('Admin access granted');
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/login');
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="release-notes">Release Notes</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SystemStats />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="release-notes">
          <ReleaseNotesAdmin />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;