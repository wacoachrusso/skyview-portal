import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, Database, Bell, Eye, Globe, HelpCircle } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy/5 via-background to-brand-slate/5">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-6 w-6 text-brand-gold" />
                  <h2 className="text-2xl font-semibold">Our Commitment to Privacy</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  At SkyGuide, we are deeply committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our aviation 
                  intelligence platform and related services.
                </p>
              </section>

              <Separator />

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-6 w-6 text-brand-gold" />
                  <h2 className="text-2xl font-semibold">Information We Collect</h2>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Name and contact information (email address)</li>
                    <li>Professional information (airline affiliation, role)</li>
                    <li>Account credentials</li>
                    <li>Payment information (processed securely by our payment provider)</li>
                  </ul>

                  <h3 className="text-lg font-medium">Usage Information</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Chat conversations and queries</li>
                    <li>Platform usage patterns and preferences</li>
                    <li>Device information and IP address</li>
                    <li>Performance analytics and error reports</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-6 w-6 text-brand-gold" />
                  <h2 className="text-2xl font-semibold">How We Protect Your Data</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We implement industry-standard security measures to protect your personal information, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>End-to-end encryption for sensitive data</li>
                    <li>Regular security audits and updates</li>
                    <li>Secure data storage and transmission protocols</li>
                    <li>Strict access controls and authentication measures</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-6 w-6 text-brand-gold" />
                  <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
                </div>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>To provide and improve our aviation intelligence services</li>
                  <li>To personalize your experience and content</li>
                  <li>To process your transactions and maintain your account</li>
                  <li>To send important updates and notifications</li>
                  <li>To analyze and improve our platform's performance</li>
                  <li>To comply with legal obligations and industry regulations</li>
                </ul>
              </section>

              <Separator />

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-6 w-6 text-brand-gold" />
                  <h2 className="text-2xl font-semibold">Your Privacy Rights</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate or incomplete data</li>
                    <li>Request deletion of your data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Export your data in a portable format</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-6 w-6 text-brand-gold" />
                  <h2 className="text-2xl font-semibold">International Data Transfers</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your data in accordance with 
                  this Privacy Policy and applicable data protection laws.
                </p>
              </section>

              <Separator />

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="h-6 w-6 text-brand-gold" />
                  <h2 className="text-2xl font-semibold">Contact Us</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                  </p>
                  <p className="font-medium">
                    <a href="mailto:support@skyguide.site" className="text-brand-gold hover:underline">
                      support@skyguide.site
                    </a>
                  </p>
                  <p>
                    We are committed to addressing any concerns you may have about our data practices and 
                    will respond to your inquiry promptly.
                  </p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;