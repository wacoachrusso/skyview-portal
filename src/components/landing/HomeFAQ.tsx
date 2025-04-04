
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export const HomeFAQ = () => {
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
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about SkyGuide
          </p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="px-6 font-medium text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 text-muted-foreground text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  );
}
