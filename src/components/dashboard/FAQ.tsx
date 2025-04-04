
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { HelpTooltip } from "@/components/shared/HelpTooltip";

export const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqs = [
    {
      question: "How do I get started with SkyGuide?",
      answer: "Simply click the 'Ask SkyGuide' quick action on your dashboard and start asking questions about your union contract."
    },
    {
      question: "What types of questions can I ask?",
      answer: "You can ask any questions related to your union contract's terms, policies, or provisions. This includes questions about work rules, benefits, scheduling, pay rates, and other contract-related topics. For non-contract questions, please consult your union representative."
    },
    {
      question: "Can I save my conversations with SkyGuide?",
      answer: "Yes! All your conversations are automatically saved and can be accessed later. You can view your conversation history by clicking on the 'Search' quick action."
    },
    {
      question: "How do I report an issue or provide feedback?",
      answer: "Use the 'Report Issue' quick action on your dashboard to submit any concerns or feedback. Our team actively monitors these reports to improve the service."
    },
    {
      question: "How can I customize my experience?",
      answer: "Click on the 'Settings' quick action to customize your experience. You can adjust notification preferences and manage your account settings."
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    
    const query = searchQuery.toLowerCase().trim();
    return faqs.filter(
      faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery, faqs]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground/90">Frequently Asked Questions</h2>
        <HelpTooltip 
          text="Here you'll find answers to common questions about SkyGuide. Use the search box to filter questions."
          className="ml-2"
          expanded
        />
      </div>
      
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="text"
          placeholder="Search FAQs..."
          className="pl-10 bg-card/50 backdrop-blur-sm border border-border/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <HelpTooltip text="Type keywords to filter questions" />
        </div>
      </div>
      
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {faq.answer}
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No FAQs matching your search. Try different keywords.
              </div>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
