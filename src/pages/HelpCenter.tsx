

import { Footer } from "@/components/landing/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/shared/navbar/Navbar";
import { faqCategories, faqs } from "@/data/helpCenter";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  

  // Filter FAQs based on search query and category
  const filteredFaqs = useMemo(() => {
    let filtered = faqs;
    
    // Filter by category if not "all"
    if (activeCategory !== "all") {
      filtered = filtered.filter(faq => faq.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        faq => 
          faq.question.toLowerCase().includes(query) || 
          faq.answer.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [searchQuery, activeCategory, faqs]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-4xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            Help Center
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-center mb-8"
            variants={itemVariants}
          >
            Find answers to common questions about using SkyGuide
          </motion.p>

          {/* Search and Filter */}
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text"
                placeholder="Search help topics..."
                className="pl-10 bg-card/50 backdrop-blur-sm border border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {faqCategories.map(category => (
                <button
                  key={category.id}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card hover:bg-card/80 text-foreground"
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={faq.id} 
                    className="bg-card rounded-lg border border-border/50 overflow-hidden"
                  >
                    <AccordionTrigger className="px-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 text-muted-foreground">
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
                <div className="p-8 text-center bg-card rounded-lg border border-border/50">
                  <p className="text-muted-foreground">No results found. Try adjusting your search or category filter.</p>
                </div>
              )}
            </Accordion>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
