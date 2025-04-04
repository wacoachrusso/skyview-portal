
import { motion } from "framer-motion";

export function Features() {
  return (
    <div className="relative py-20 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient opacity-20" />
      <div className="container mx-auto px-4 relative">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Why Choose SkyGuide?
        </h2>
        <p className="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Get instant, accurate answers to your contract questions with our advanced AI technology.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              iconSvg: (
                <svg className="premium-icon" width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    whileHover={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    d="M40 10L47.5 25L62.5 27.5L52.5 40L55 55L40 47.5L25 55L27.5 40L17.5 27.5L32.5 25L40 10Z" 
                    stroke="url(#rocketGradient)" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="rgba(212, 175, 55, 0.1)"
                  />
                  <motion.path 
                    initial={{ y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    d="M40 25C40 25 45 30 45 35C45 40 40 50 40 50C40 50 35 40 35 35C35 30 40 25 40 25Z" 
                    fill="url(#rocketGlow)" 
                  />
                  <defs>
                    <linearGradient id="rocketGradient" x1="17.5" y1="10" x2="62.5" y2="55" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFD700" />
                      <stop offset="1" stopColor="#FFA500" />
                    </linearGradient>
                    <radialGradient id="rocketGlow" cx="40" cy="35" r="10" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFD700" />
                      <stop offset="1" stopColor="#FFA500" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              ),
              title: "Instant Answers",
              description: "Get immediate responses to your contract questions, 24/7",
              details: "Our AI processes your queries in real-time, providing accurate interpretations of complex contract clauses instantly."
            },
            {
              iconSvg: (
                <svg className="premium-icon" width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    whileHover={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    d="M25 55L40 15L55 55L25 55Z" 
                    stroke="url(#awardGradient)" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="rgba(212, 175, 55, 0.1)"
                  />
                  <motion.circle 
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    cx="40" 
                    cy="35" 
                    r="8" 
                    fill="url(#awardGlow)" 
                  />
                  <defs>
                    <linearGradient id="awardGradient" x1="25" y1="15" x2="55" y2="55" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#9b87f5" />
                      <stop offset="1" stopColor="#7E69AB" />
                    </linearGradient>
                    <radialGradient id="awardGlow" cx="40" cy="35" r="8" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#9b87f5" />
                      <stop offset="1" stopColor="#7E69AB" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              ),
              title: "High Accuracy",
              description: "Trained on your specific contract for precise interpretations",
              details: "Our system is trained on airline-specific contracts, ensuring responses are tailored to your exact situation."
            },
            {
              iconSvg: (
                <svg className="premium-icon" width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.circle 
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    cx="40" 
                    cy="40" 
                    r="25" 
                    stroke="url(#globeGradient)" 
                    strokeWidth="2"
                    fill="rgba(59, 130, 246, 0.1)"
                  />
                  <motion.path 
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 25 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    d="M15 40H65M40 15V65M25 20C25 20 32.5 30 40 30C47.5 30 55 20 55 20M20 55C20 55 30 47.5 30 40C30 32.5 20 25 20 25M55 25C55 25 45 32.5 45 40C45 47.5 55 55 55 55M25 60C25 60 32.5 50 40 50C47.5 50 55 60 55 60" 
                    stroke="url(#globeLines)" 
                    strokeWidth="1.5"
                    strokeLinecap="round" 
                    style={{ transformOrigin: 'center' }}
                  />
                  <defs>
                    <linearGradient id="globeGradient" x1="15" y1="15" x2="65" y2="65" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3B82F6" />
                      <stop offset="1" stopColor="#1E40AF" />
                    </linearGradient>
                    <linearGradient id="globeLines" x1="15" y1="15" x2="65" y2="65" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#93C5FD" />
                      <stop offset="1" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
              ),
              title: "Always Available",
              description: "Access from anywhere, on any device, whenever you need it",
              details: "Whether you're at home or on layover, get instant contract clarification from any device."
            },
            {
              iconSvg: (
                <svg className="premium-icon" width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.circle 
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    cx="40" 
                    cy="40" 
                    r="25" 
                    stroke="url(#clockGradient)" 
                    strokeWidth="2"
                    fill="rgba(107, 114, 128, 0.1)"
                  />
                  <motion.g
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    style={{ transformOrigin: 'center' }}
                  >
                    <path d="M40 25V40L50 50" stroke="url(#clockHands)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.g>
                  <motion.g
                    initial={{ opacity: 0.5 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {[...Array(12)].map((_, i) => (
                      <rect 
                        key={i}
                        x="39" 
                        y="18" 
                        width="2" 
                        height="4" 
                        fill="#D1D5DB" 
                        transform={`rotate(${i * 30} 40 40)`}
                      />
                    ))}
                  </motion.g>
                  <defs>
                    <linearGradient id="clockGradient" x1="15" y1="15" x2="65" y2="65" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#D1D5DB" />
                      <stop offset="1" stopColor="#6B7280" />
                    </linearGradient>
                    <linearGradient id="clockHands" x1="40" y1="25" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F97316" />
                      <stop offset="1" stopColor="#EA580C" />
                    </linearGradient>
                  </defs>
                </svg>
              ),
              title: "Time Saving",
              description: "Save hours searching through contract documents",
              details: "Stop spending hours reading through contract pages. Get the answers you need in seconds."
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4), 0 8px 10px -6px rgba(59, 130, 246, 0.2)"
              }}
              className="relative bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-6 rounded-lg shadow-lg border border-white/5 hover:border-white/10 transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-glow-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg" />
              <div className="relative">
                <div className="flex justify-center mb-6 transform transition-transform duration-300">
                  {feature.iconSvg}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-300 mb-4 text-center">{feature.description}</p>
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  whileHover={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-gray-400 text-sm pt-4 border-t border-white/10 text-center">{feature.details}</p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
