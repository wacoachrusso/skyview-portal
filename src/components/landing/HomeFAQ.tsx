import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function HomeFAQ() {
  const faqs = [
    {
      question: "Why should I use SkyGuide?",
      answer: "SkyGuide is your dedicated contract interpretation companion, providing instant, accurate answers to your contract questions 24/7. Whether you're on a layover or at home, you can get reliable contract clarification within seconds, saving you hours of manual document searching."
    },
    {
      question: "What makes SkyGuide different from just reading my contract?",
      answer: "SkyGuide streamlines contract interpretation by instantly finding relevant sections and providing clear explanations. Instead of spending hours searching through hundreds of pages, you get immediate, accurate answers specific to your situation, helping you make informed decisions quickly."
    },
    {
      question: "How does SkyGuide ensure accuracy?",
      answer: "Every response is based directly on your official union contract, with specific section references provided so you can verify the information. The system is regularly updated to ensure all interpretations align with the latest contract terms."
    },
    {
      question: "Who can benefit from using SkyGuide?",
      answer: "SkyGuide is valuable for all aviation professionals, from new hires to senior crew members. It's particularly helpful during bid periods, when dealing with scheduling issues, or when you need quick clarification on contract provisions during operations."
    },
    {
      question: "What types of contract questions can I ask?",
      answer: "You can ask about any aspect of your contract, including scheduling rules, pay provisions, benefits, vacation policies, reserve rules, and more. SkyGuide helps you understand complex contract language and how it applies to your specific situation."
    },
    {
      question: "Is my information secure?",
      answer: "Absolutely. We prioritize the security and confidentiality of all user interactions. All data is encrypted and stored securely, and access is strictly limited to authorized users only."
    }
  ];

  return (
    <section className="relative py-20 bg-background">
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Learn how SkyGuide can help you understand and navigate your contract with confidence
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card-gradient border border-white/10 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5">
                  <span className="text-left text-lg font-semibold text-white">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}