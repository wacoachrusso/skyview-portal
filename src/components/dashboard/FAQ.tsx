import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export const FAQ = () => {
  const faqs = [
    {
      question: "How do I get started with SkyGuide?",
      answer: "Begin by uploading your union contract through the Quick Actions menu. Once uploaded, you can start asking questions about your contract using the chat feature. Our AI will analyze your contract and provide accurate answers based on its contents."
    },
    {
      question: "What types of questions can I ask?",
      answer: "You can ask any questions related to your union contract's terms, policies, or provisions. For example, you can ask about scheduling rules, pay rates, vacation policies, or specific sections of your contract. The AI will provide answers based solely on your contract's content."
    },
    {
      question: "How accurate are the responses?",
      answer: "SkyGuide provides answers directly from your contract's content. However, for critical matters, we recommend verifying the information with your union representative or official documentation. The AI is a tool to help you understand your contract better, not a replacement for official guidance."
    },
    {
      question: "Can I save or reference previous conversations?",
      answer: "Yes! All your conversations are automatically saved and can be accessed through the chat history in the Chat section. You can easily reference previous discussions or continue conversations where you left off."
    },
    {
      question: "How do I update my contract if changes occur?",
      answer: "If your contract gets updated, simply upload the new version through the Quick Actions menu. The system will automatically use the most recent version of your contract when answering questions."
    },
    {
      question: "What should I do if I need additional help?",
      answer: "If you need assistance, you can use the 'Report Issue' button in Quick Actions to contact support. For union-specific matters, we recommend reaching out to your union representative directly."
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground/90">Frequently Asked Questions</h2>
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <Accordion type="single" collapsible className="p-6">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="hover:text-brand-gold transition-colors">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
};