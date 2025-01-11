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
            Find answers to commonly asked questions about SkyGuide
          </p>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">What is SkyGuide?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                SkyGuide is a professional tool designed specifically for aviation professionals to help them understand and navigate their union contracts efficiently.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">How can SkyGuide help me with my contract?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                SkyGuide provides instant, accurate answers to your contract-related questions, helping you understand your rights, benefits, and obligations under your union agreement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">What types of questions can I ask?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                You can ask about any aspect of your contract, including scheduling rules, pay provisions, benefits, vacation policies, reserve rules, and more.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">Is my information secure?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                Yes, we take security seriously. All your data is encrypted and stored securely. We never share your information with third parties.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">What subscription plans are available?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                We offer flexible subscription plans to meet your needs. Visit our pricing page to learn more about our available options and features.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-card rounded-lg border border-border/50">
              <AccordionTrigger className="px-4">How do I get started?</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                Getting started is easy! Simply sign up for an account, choose your subscription plan, and you'll have immediate access to our contract interpretation tools.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
}