import { useState } from "react";
import { AdminHeader } from "@/components/admin/dashboard/AdminHeader";
import { AdminTabs } from "@/components/admin/dashboard/AdminTabs";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  console.log('Rendering AdminDashboard component');
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  
  // Check admin access on component mount
  useAdminAccess();

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default AdminDashboard;