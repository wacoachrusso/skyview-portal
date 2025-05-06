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
import { useTheme } from "../theme-provider";

export const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {theme} = useTheme();

  const isDark = theme === "dark";

  const faqs = [
    {
      question: "How do I get started with SkyGuide?",
      answer: "Simply click the 'Ask SkyGuide' quick action on your dashboard and start asking questions about your union contract.",
    },
    {
      question: "What types of questions can I ask?",
      answer: "You can ask any questions related to your union contract's terms, policies, or provisions...",
    },
    {
      question: "Can I save my conversations with SkyGuide?",
      answer: "Yes! All your conversations are automatically saved and can be accessed later...",
    },
    {
      question: "How do I report an issue or provide feedback?",
      answer: "Use the 'Report Issue' quick action on your dashboard to submit any concerns or feedback...",
    },
    {
      question: "How can I customize my experience?",
      answer: "Click on the 'Settings' quick action to customize your experience...",
    },
  ];

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase().trim();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery, faqs]);

  return (
    <div className={isDark ? "text-white" : "text-black"}>
      <div className="flex items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold opacity-90">Frequently Asked Questions</h2>
      </div>

      <div className="relative mb-3 sm:mb-4">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        />
        <Input
          type="text"
          placeholder="Search FAQs..."
          className={`pl-10 border backdrop-blur-sm ${
            isDark
              ? "bg-card/50  border-border/50 text-white placeholder:text-gray-400"
              : "bg-gray-100 border-gray-300 text-black placeholder:text-gray-500"
          }`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card
        className={`backdrop-blur-sm border ${
          isDark ? "bg-card/50  border-border/50" : "bg-gray-100 border-gray-200"
        }`}
      >
        <CardContent className="p-3 sm:p-4 md:p-6">
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger
                    className={`text-left text-sm sm:text-base py-3 sm:py-4 ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent
                    className={`text-xs sm:text-sm ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
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
              <div
                className={`py-3 sm:py-4 text-center text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No FAQs matching your search. Try different keywords.
              </div>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
