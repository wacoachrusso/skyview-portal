import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuthManagement } from "@/hooks/useAuthManagement";

const PrivacyPolicy = () => {
  const { userEmail, handleSignOut } = useAuthManagement();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy/5 via-background to-brand-slate/5">
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-8 prose prose-slate dark:prose-invert max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <section className="mb-8">
          <h2>Introduction</h2>
          <p>
            At SkyGuide, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2>Information We Collect</h2>
          <ul>
            <li>Account information (email, name, airline)</li>
            <li>Usage data and analytics</li>
            <li>Chat conversations and queries</li>
            <li>Technical information (IP address, browser type)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information,
            including encryption and secure storage practices.
          </p>
        </section>

        <section className="mb-8">
          <h2>Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information.
            You can manage your privacy settings and consent preferences in your account settings.
          </p>
        </section>

        <section className="mb-8">
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at
            privacy@skyguide.com
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;