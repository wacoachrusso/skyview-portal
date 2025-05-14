// ReferralSection.tsx
import { EmailInviteForm } from "./referrals/EmailInviteForm";
import { useTheme } from "@/components/theme-provider";

export function ReferralSection() {
  const { theme } = useTheme();
  
  return (
    <div className={`${
      theme === "dark" 
        ? "bg-gradient-to-br from-brand-navy to-brand-slate" 
        : "bg-gradient-to-br from-slate-50 to-slate-200"
    } py-16`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className={`${
            theme === "dark"
              ? "bg-white/10 border-white/20 backdrop-blur-sm" 
              : "bg-white/70 border-slate-200 backdrop-blur-sm"
          } rounded-lg p-8 border text-center`}>
            <h2 className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-800"
            } mb-6`}>
              Invite Your Colleagues
            </h2>
            
            <p className={`${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            } mb-8`}>
              Share SkyGuide with your colleagues and help them navigate their contracts more effectively. Both you and your colleague will receive special rewards.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className={`${
                theme === "dark"
                  ? "bg-white/5 border-white/10" 
                  : "bg-slate-100 border-slate-200"
              } rounded-lg p-5 border`}>
                <h3 className="text-xl font-semibold text-brand-gold mb-3">For You (Referrer)</h3>
                <ul className={`${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                } text-sm space-y-2 text-left`}>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-2">•</span>
                    <span>$5 credit or 10% off your next renewal</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-2">•</span>
                    <span>Refer multiple friends for bigger savings</span>
                  </li>
                </ul>
              </div>
              
              <div className={`${
                theme === "dark"
                  ? "bg-white/5 border-white/10" 
                  : "bg-slate-100 border-slate-200"
              } rounded-lg p-5 border`}>
                <h3 className="text-xl font-semibold text-brand-gold mb-3">For Your Friend</h3>
                <ul className={`${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                } text-sm space-y-2 text-left`}>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-2">•</span>
                    <span>50% off their first month</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-2">•</span>
                    <span>OR an extra free month with annual plan</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Email Invite Form */}
          <div className="mt-8">
            <EmailInviteForm />
          </div>
        </div>
      </div>
    </div>
  );
}