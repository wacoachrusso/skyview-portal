
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

export const HomeFAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqs = [
    {
      question: "Why should I use SkyGuide?",
      answer: "SkyGuide makes it easy to understand your union contract. Get instant answers to your questions about work rules, benefits, scheduling, and more - available 24/7 whenever you need it."
    },
    {
      question: "How does SkyGuide help me?",
      answer: "SkyGuide provides clear, straightforward answers to your contract questions, with references to specific sections so you can verify the information yourself."
    },
    {
      question: "Who can benefit from using SkyGuide?",
      answer: "All union members can benefit from SkyGuide, whether you're new to the contract or an experienced member looking to quickly reference specific provisions."
    },
    {
      question: "What can I ask about?",
      answer: "You can ask about any aspect of your contract, including scheduling rules, pay provisions, benefits, vacation policies, reserve rules, and more."
    },
    {
      question: "Is my information secure?",
      answer: "Yes. We prioritize your privacy and security. All conversations are private and only accessible to you."
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-16 bg-background">
      <motion.div 
        className="container max-w-4xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Find answers to common questions about SkyGuide
          </p>
          
          {/* Search input */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search FAQs..."
              className="pl-10 bg-card/50 backdrop-blur-sm border border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="overflow-hidden">
                    <AccordionTrigger className="px-6 font-medium text-lg">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 text-muted-foreground text-base leading-relaxed">
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
                <div className="p-6 text-center text-muted-foreground">
                  No FAQs matching your search. Try different keywords.
                </div>
              )}
            </Accordion>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  );
}
