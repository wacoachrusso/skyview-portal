import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export const FAQ = () => {
  const faqs = [
    {
      question: "How do I get started with SkyGuide?",
      answer: "Begin by clicking the 'Ask SkyGuide' quick action on your dashboard. You can ask questions about your union contract, and we'll provide relevant information and explanations from your contract documents. Make sure to upload your contract document first for the most accurate responses."
    },
    {
      question: "What types of questions can I ask?",
      answer: "You can ask any questions related to your union contract's terms, policies, or provisions. This includes questions about work rules, benefits, scheduling, pay rates, and other contract-related topics. For non-contract questions, please consult your union representative."
    },
    {
      question: "How do I upload my contract document?",
      answer: "Click on the 'Contract' quick action on your dashboard. You can then upload your contract document in PDF format. Once uploaded, SkyGuide will be able to reference your specific contract when providing answers."
    },
    {
      question: "Can I save my conversations with SkyGuide?",
      answer: "Yes! All your conversations are automatically saved and can be accessed later. You can view your conversation history by clicking on the 'Search' quick action, which allows you to find previous discussions and answers."
    },
    {
      question: "How do I report an issue or provide feedback?",
      answer: "Use the 'Report Issue' quick action on your dashboard to submit any technical issues, incorrect information, or general feedback. Our team actively monitors these reports to improve the service."
    },
    {
      question: "How can I customize my experience?",
      answer: "Click on the 'Settings' quick action to customize your experience. You can adjust notification preferences, manage your account settings, and configure other preferences to make SkyGuide work better for you."
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground/90">Frequently Asked Questions</h2>
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};