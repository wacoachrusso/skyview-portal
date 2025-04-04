
import { motion } from "framer-motion";

export function RocketIcon() {
  return (
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
  );
}

export function AccuracyIcon() {
  return (
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
  );
}

export function GlobeIcon() {
  return (
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
  );
}

export function ClockIcon() {
  return (
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
  );
}
