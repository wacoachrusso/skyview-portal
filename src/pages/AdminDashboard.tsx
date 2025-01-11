import { useState, Suspense } from "react";
import { AdminHeader } from "@/components/admin/dashboard/AdminHeader";
import { AdminTabs } from "@/components/admin/dashboard/AdminTabs";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertDescription>
        Error loading admin dashboard: {error.message}
      </AlertDescription>
    </Alert>
  );
};

const AdminDashboard = () => {
  console.log('Rendering AdminDashboard component');
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  
  // Check admin access on component mount
  useAdminAccess();

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('Admin Dashboard Error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load admin dashboard. Please try again."
        });
      }}
    >
      <Suspense 
        fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <div className="container mx-auto px-4 py-8">
          <AdminHeader />
          <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AdminDashboard;