import React, { ReactNode } from "react";
import GlobalNavbar from "../shared/navbar/GlobalNavbar";
import { Footer } from "../landing/Footer";
import { useLocation } from "react-router-dom";

interface PublicLayoutProps {
  children: ReactNode;
}
const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
    const location = useLocation();
    const isHomePage = location.pathname === "/";
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy/5 via-[#050d1d] to-brand-slate/5 flex flex-col overflow-hidden">
      <GlobalNavbar />
      <div className={`flex-1 w-full ${isHomePage ? "mt-0" : "mt-20"}`}>

      {children}
      </div>
      <Footer />
    </div>
  );
};

export default PublicLayout;
