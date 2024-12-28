import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthManagement } from "@/hooks/useAuthManagement";

const Dashboard = () => {
  const { userEmail, isLoading, handleSignOut } = useAuthManagement();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy/5 via-background to-brand-slate/5">
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-8 max-w-7xl relative">
        <div className="space-y-6">
          <WelcomeCard />
          <QuickActions />
          <RecentActivity />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;