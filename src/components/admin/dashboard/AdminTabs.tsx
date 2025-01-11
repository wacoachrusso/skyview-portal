import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemStats } from "@/components/admin/SystemStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { AlphaTesters } from "@/components/admin/AlphaTesters";
import { ReleaseNotesAdmin } from "@/components/admin/ReleaseNotesAdmin";
import { NotificationManager } from "@/components/admin/NotificationManager";

interface AdminTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const AdminTabs = ({ activeTab, setActiveTab }: AdminTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">User Management</TabsTrigger>
        <TabsTrigger value="alpha-testers">Alpha Testers</TabsTrigger>
        <TabsTrigger value="release-notes">Release Notes</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <SystemStats />
      </TabsContent>

      <TabsContent value="users">
        <UserManagement />
      </TabsContent>

      <TabsContent value="alpha-testers">
        <AlphaTesters />
      </TabsContent>

      <TabsContent value="release-notes">
        <ReleaseNotesAdmin />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationManager />
      </TabsContent>
    </Tabs>
  );
};