
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReleaseNotesAdmin } from "@/components/admin/ReleaseNotesAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, Mail } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemStats } from "@/components/admin/SystemStats";
import { NotificationManager } from "@/components/admin/NotificationManager";
import { AlphaTesters } from "@/components/admin/AlphaTesters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SetPasswordPanel } from "@/components/admin/SetPasswordPanel";
import { EmailQueueManager } from "@/components/admin/EmailQueueManager";
import { EmailTemplatePreview } from "@/components/admin/EmailTemplatePreview";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Ensure admin status is set in localStorage
  useEffect(() => {
    localStorage.setItem('user_is_admin', 'true');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")} 
            className="gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => navigate("/chat")} 
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Go to Chat
          </Button>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <SetPasswordPanel />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="alpha-testers">Alpha Testers</TabsTrigger>
          <TabsTrigger value="release-notes">Release Notes</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="emails">Email Queue</TabsTrigger>
          <TabsTrigger value="email-templates">
            <Mail className="h-4 w-4 mr-2" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><SystemStats /></TabsContent>
        <TabsContent value="users"><UserManagement /></TabsContent>
        <TabsContent value="alpha-testers"><AlphaTesters /></TabsContent>
        <TabsContent value="release-notes"><ReleaseNotesAdmin /></TabsContent>
        <TabsContent value="notifications"><NotificationManager /></TabsContent>
        <TabsContent value="emails"><EmailQueueManager /></TabsContent>
        <TabsContent value="email-templates"><EmailTemplatePreview /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
