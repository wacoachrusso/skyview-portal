import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-footer-gradient text-gray-400 py-12 px-4">
      <div className="absolute inset-0 bg-glow-gradient opacity-10" />
      <div className="container mx-auto relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4 text-white">SkyGuide</h3>
            <p className="text-sm">
              Your trusted companion for contract interpretation.
            </p>
            <a href="mailto:support@skyguide.site" className="text-sm hover:text-white transition-colors mt-2 block">
              support@skyguide.site
            </a>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-sm hover:text-white transition-colors">About Us</a></li>
              <li><a href="mailto:support@skyguide.site" className="text-sm hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="/privacy-policy" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/refunds" className="text-sm hover:text-white transition-colors">Refund Policy</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li><a href="/help-center" className="text-sm hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">FAQs</a></li>
              <li><a href="mailto:support@skyguide.site" className="text-sm hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-white">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm">
          © 2024 SkyGuide. All rights reserved.
        </div>
      </div>
      
      {/* Back to Top Button */}
      <Button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 rounded-full w-12 h-12 bg-brand-gold hover:bg-brand-gold/90 text-brand-navy shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        size="icon"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
    </footer>
  );
}