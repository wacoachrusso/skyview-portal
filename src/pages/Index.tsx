
import { WaitlistPage } from "@/components/waitlist/WaitlistPage";
import { LandingPageContent } from "@/components/landing/LandingPageContent";
import { LandingLoadingSpinner } from "@/components/landing/LandingLoadingSpinner";
import { AdminLoginLink } from "@/components/landing/AdminLoginLink";
import { useWaitlistSettings } from "@/hooks/useWaitlistSettings";

export default function Index() {
  const { showWaitlist, waitlistForceOpen, waitlistLoading } = useWaitlistSettings();

  if (waitlistLoading) {
    return <LandingLoadingSpinner />;
  }

  console.log("Rendering Index with showWaitlist:", showWaitlist);

  if (showWaitlist) {
    return (
      <div>
        <WaitlistPage forceOpen={waitlistForceOpen} />
        <AdminLoginLink />
      </div>
    );
  }

  return <LandingPageContent />;
}
