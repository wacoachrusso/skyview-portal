
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
    { label: "Help Center", href: "/help-center" },
    { label: "Contact Support", href: "mailto:support@skyguide.site" },
  ];

  const socials = [
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5" aria-hidden="true" />,
      href: "#",
      ariaLabel: "Visit our Twitter page"
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" aria-hidden="true" />,
      href: "#",
      ariaLabel: "Visit our LinkedIn page"
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" aria-hidden="true" />,
      href: "#",
      ariaLabel: "Visit our Facebook page"
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5" aria-hidden="true" />,
      href: "#",
      ariaLabel: "Visit our Instagram page"
    },
    {
      name: "YouTube",
      icon: <Youtube className="w-5 h-5" aria-hidden="true" />,
      href: "#",
      ariaLabel: "Visit our YouTube channel"
    },
    {
      name: "Email",
      icon: <Mail className="w-5 h-5" aria-hidden="true" />,
      href: "mailto:support@skyguide.site",
      ariaLabel: "Email us"
    }
  ];

  return (
    <footer className="relative overflow-hidden text-gray-300 py-16 px-4" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      {/* Patterned background */}
      <div className="absolute inset-0 bg-footer-gradient">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-glow-gradient opacity-10"></div>
      </div>
      
      <div className="container mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
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
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © {new Date().getFullYear()} SkyGuide. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <a href="#" className="text-xs hover:text-white transition-colors">
                Accessibility
              </a>
              <span className="text-white/20">|</span>
              <a href="#" className="text-xs hover:text-white transition-colors">
                Sitemap
              </a>
              <span className="text-white/20">|</span>
              <a href="#" className="text-xs hover:text-white transition-colors">
                Legal
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll to top button */}
      <Button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 rounded-full w-12 h-12 bg-brand-gold hover:bg-brand-gold/90 text-brand-navy shadow-gold hover:shadow-gold-hover transition-all duration-300 z-50 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-navy"
        size="icon"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
    </footer>
  );
}
