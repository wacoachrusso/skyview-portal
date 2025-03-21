
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Copy, RefreshCw } from "lucide-react";
import { getBaseEmailTemplate } from "@/utils/emailTemplates/baseTemplate";
import { getWelcomeEmailContent } from "@/utils/emailTemplates/welcomeEmail";
import { getAlphaStatusEmailContent } from "@/utils/emailTemplates/alphaStatusEmail";
import { useToast } from "@/hooks/use-toast";

type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  getContent: (params: any) => string;
  defaultParams: any;
};

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Sent to new users when they first sign up",
    getContent: getWelcomeEmailContent,
    defaultParams: {
      fullName: "John Doe",
      email: "example@skyguide.site",
      temporaryPassword: "Temp1234!",
      loginUrl: "https://skyguide.site/login",
      isPromoter: false,
    },
  },
  {
    id: "alpha-status-active",
    name: "Alpha Tester - Activated",
    description: "Sent when a user is activated as an alpha tester",
    getContent: getAlphaStatusEmailContent,
    defaultParams: {
      fullName: "Jane Smith",
      status: "active",
      isPromoterChange: false,
    },
  },
  {
    id: "alpha-status-promoter",
    name: "Promoter - Activated",
    description: "Sent when a user is activated as a promoter",
    getContent: getAlphaStatusEmailContent,
    defaultParams: {
      fullName: "Alex Johnson",
      status: "active",
      isPromoterChange: true,
      becamePromoter: true,
    },
  },
  {
    id: "subscription-feedback",
    name: "Subscription Feedback",
    description: "Sent to users to request feedback on their subscription",
    getContent: () => {
      return getBaseEmailTemplate(`
        <h1 style="color: #1a365d; text-align: center;">Hello Jane!</h1>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Thank you for choosing SkyGuide as your aviation career partner. We hope you're finding value in your monthly subscription.</p>
          
          <p>We'd love to hear about your experience with SkyGuide:</p>
          
          <ul style="color: #1a365d;">
            <li>How has SkyGuide helped you understand your contract terms?</li>
            <li>What features do you find most useful?</li>
            <li>Is there anything we could improve?</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://skyguide.site/feedback" 
             style="background-color: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Share Your Feedback
          </a>
        </div>
      `);
    },
    defaultParams: {},
  },
  {
    id: "trial-ended",
    name: "Trial Ended Email",
    description: "Sent when a user's free trial period ends",
    getContent: () => {
      return getBaseEmailTemplate(`
        <h2 style="color: #1a1f2c; margin-bottom: 20px;">Time to Upgrade Your SkyGuide Experience!</h2>
        
        <p>Hi Sarah,</p>
        
        <p>You've completed your free trial query with SkyGuide. Ready to unlock unlimited access? Choose the plan that works best for you:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #1a1f2c; margin-top: 0;">Available Plans:</h3>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin: 15px 0; padding-left: 25px;">
              🌟 <strong>Monthly Plan - $4.99/month</strong>
              <br>Perfect for active flight crew
            </li>
            <li style="margin: 15px 0; padding-left: 25px;">
              ⭐ <strong>Annual Plan - $49.88/year</strong>
              <br>Best value - Save $10 annually
            </li>
          </ul>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://skyguide.site/?scrollTo=pricing-section" 
             style="background-color: #fbbf24; color: #1a1f2c; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Choose Your Plan
          </a>
        </div>
      `);
    },
    defaultParams: {},
  },
  {
    id: "plan-change",
    name: "Plan Change Email",
    description: "Sent when a user changes their subscription plan",
    getContent: () => {
      return getBaseEmailTemplate(`
        <h1 style="color: #2D3748; font-size: 24px; font-weight: bold; margin: 0 0 20px;">Hello Sam,</h1>
        
        <p>Great choice on switching to our annual plan! Here's what you get:</p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>✓ $10 annual savings</li>
          <li>✓ All premium features</li>
          <li>✓ Priority support</li>
        </ul>
        <p>Your new billing cycle: $49.99/year</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://skyguide.site/dashboard" 
             style="display: inline-block; background-color: #0F172A; border-radius: 8px; padding: 12px 25px; color: white; text-decoration: none; font-weight: bold;">
            Explore Premium Features
          </a>
        </div>
      `);
    },
    defaultParams: {},
  },
];

export function EmailTemplatePreview() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCopyHtml = () => {
    const html = selectedTemplate.getContent(selectedTemplate.defaultParams);
    navigator.clipboard.writeText(html);
    toast({
      title: "HTML Copied",
      description: "The email template HTML has been copied to your clipboard.",
    });
  };

  const refreshPreview = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Email Templates</h2>
          <p className="text-muted-foreground">
            Preview all email templates used in the application.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyHtml}
            className="gap-2"
          >
            <Copy className="h-4 w-4" /> Copy HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPreview}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Selection</CardTitle>
              <CardDescription>Choose an email template to preview</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedTemplate.id}
                onValueChange={(value) => {
                  const template = EMAIL_TEMPLATES.find((t) => t.id === value);
                  if (template) {
                    setSelectedTemplate(template);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mt-6">
                <h3 className="font-medium mb-2">{selectedTemplate.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedTemplate.description}
                </p>
              </div>

              <Tabs
                value={previewMode}
                onValueChange={(value) => setPreviewMode(value as "desktop" | "mobile")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="desktop">
                    <Eye className="h-4 w-4 mr-2" /> Desktop
                  </TabsTrigger>
                  <TabsTrigger value="mobile">
                    <Eye className="h-4 w-4 mr-2" /> Mobile
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
              <CardDescription>
                {previewMode === "desktop" ? "Desktop view (600px)" : "Mobile view (320px)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border rounded-md overflow-hidden ${
                  previewMode === "desktop" ? "w-full max-w-[600px]" : "w-full max-w-[320px]"
                } mx-auto`}
                style={{ height: "80vh" }}
              >
                <iframe
                  key={refreshKey}
                  srcDoc={selectedTemplate.getContent(selectedTemplate.defaultParams)}
                  title="Email Template Preview"
                  className="w-full h-full"
                  sandbox="allow-same-origin"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
