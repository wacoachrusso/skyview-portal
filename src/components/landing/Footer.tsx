
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { SocialLinks } from "@/components/ui/social-links";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refunds" },
    { label: "Terms of Service", href: "#" },
  ];

  const supportLinks = [
    { label: "FAQs", href: "/#faq" },
    { label: "Contact Support", href: "mailto:support@skyguide.site" },
  ];

  const socials = [
    {
      name: "Twitter",
      icon: <Twitter className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />,
      href: "#",
      ariaLabel: "Visit our Twitter page"
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />,
      href: "#",
      ariaLabel: "Visit our LinkedIn page"
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />,
      href: "#",
      ariaLabel: "Visit our Facebook page"
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />,
      href: "#",
      ariaLabel: "Visit our Instagram page"
    },
    {
      name: "YouTube",
      icon: <Youtube className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />,
      href: "#",
      ariaLabel: "Visit our YouTube channel"
    },
    {
      name: "Email",
      icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />,
      href: "mailto:support@skyguide.site",
      ariaLabel: "Email us"
    }
  ];

  return (
    <footer className="relative overflow-hidden text-gray-300 py-10 sm:py-16 px-4" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      {/* Patterned background */}
      <div className="absolute inset-0 bg-footer-gradient">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-glow-gradient opacity-10"></div>
      </div>
      
      <div className="container mx-auto relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and company info */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-white mb-4 border-b border-white/10 pb-2">SkyGuide</h3>
            <p className="text-sm mb-4">
              Your trusted companion for contract interpretation and guidance.
            </p>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-brand-gold" aria-hidden="true" />
              <a 
                href="mailto:support@skyguide.site" 
                className="text-sm hover:text-white transition-colors underline-offset-4 hover:underline"
                aria-label="Email support@skyguide.site"
              >
                support@skyguide.site
              </a>
            </div>
          </div>
          
          {/* Company links */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-white mb-4 border-b border-white/10 pb-2">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm hover:text-white transition-colors flex items-center space-x-1 w-fit hover:translate-x-1 duration-200"
                  >
                    <span className="text-brand-gold">•</span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support links */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-white mb-4 border-b border-white/10 pb-2">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm hover:text-white transition-colors flex items-center space-x-1 w-fit hover:translate-x-1 duration-200"
                  >
                    <span className="text-brand-gold">•</span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Social links */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-white mb-4 border-b border-white/10 pb-2">Connect</h3>
            <SocialLinks socials={socials} layoutType="grid" />
          </div>
        </div>
        
        {/* Bottom divider and copyright */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex justify-center items-center">
            <p className="text-sm">
              © {new Date().getFullYear()} SkyGuide. All rights reserved.
            </p>
        </div>
      </div>
      
      {/* Scroll to top button */}
      <Button
        onClick={scrollToTop}
        className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-brand-gold hover:bg-brand-gold/90 text-brand-navy shadow-gold hover:shadow-gold-hover transition-all duration-300 z-50 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-navy"
        size="icon"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </footer>
  );
}
