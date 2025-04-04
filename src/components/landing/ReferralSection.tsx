
import { ReferralDashboard } from "./referrals/ReferralDashboard";

export function ReferralSection() {
  return (
    <div className="bg-gradient-to-br from-brand-navy to-brand-slate py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Refer Friends & Earn Rewards
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-xl font-semibold text-brand-gold mb-3">For You (Referrer)</h3>
                <ul className="text-gray-200 text-sm space-y-2 text-left">
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-2">•</span>
                    <span>$5 credit or 10% off your next renewal</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-2">•</span>
                    <span>Refer multiple friends for bigger savings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-2">•</span>
                    <span>Up to one free annual subscription per year</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-xl font-semibold text-brand-gold mb-3">For Your Friend</h3>
                <ul className="text-gray-200 text-sm space-y-2 text-left">
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-2">•</span>
                    <span>50% off their first month</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-2">•</span>
                    <span>OR an extra free month with annual plan</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-2">•</span>
                    <span>Applied automatically at signup</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Referral Dashboard - shown only for logged in users */}
          <ReferralDashboard />
        </div>
      </div>
    </div>
  );
}
