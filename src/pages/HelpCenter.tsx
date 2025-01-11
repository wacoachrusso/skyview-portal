import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Help Center</h1>
          <p className="text-muted-foreground text-center mb-12">
            Find answers to common questions about using SkyGuide
          </p>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">How do I get started with SkyGuide?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                Getting started is easy! Simply create an account, choose your subscription plan, and you'll have immediate access to our contract interpretation tools.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">What subscription plans are available?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                We offer flexible subscription plans to meet your needs. Visit our pricing page to learn more about our available options and features.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">How do I update my account information?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                You can update your account information by logging in and navigating to your Account Settings. There you can modify your personal details, notification preferences, and subscription settings.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">How can I contact support?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                You can reach our support team by emailing support@skyguide.site. We aim to respond to all inquiries within 24 hours during business days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">What payment methods do you accept?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                We accept all major credit cards including Visa, MasterCard, and American Express. All payments are processed securely through our payment provider.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">How do I cancel my subscription?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                You can cancel your subscription at any time through your Account Settings. If you need assistance, our support team is always ready to help.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">Is my information secure?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                Yes, we take security seriously. All your data is encrypted and stored securely. We never share your information with third parties.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">How do I reset my password?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                If you've forgotten your password, click the "Forgot Password" link on the login page. You'll receive an email with instructions to reset your password.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
}