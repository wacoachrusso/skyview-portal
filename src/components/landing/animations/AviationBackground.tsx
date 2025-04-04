
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const AviationBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden z-0 opacity-20 pointer-events-none"
      aria-hidden="true"
    >
      {/* Main container for aviation elements */}
      <div className="absolute inset-0">
        {/* Animated clouds */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute"
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${20 + Math.random() * 40}%`,
              opacity: 0.6 + Math.random() * 0.4,
              scale: 0.8 + Math.random() * 0.4
            }}
            animate={{
              x: ["0%", "100%", "0%"],
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
              duration: 80 + Math.random() * 120,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 5
            }}
          >
            <svg
              width={100 + Math.random() * 150}
              height={50 + Math.random() * 40}
              viewBox="0 0 200 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30,50 Q40,20 75,30 Q100,10 120,30 Q140,20 160,40 Q190,30 190,50 Q190,70 170,60 Q170,90 140,70 Q130,90 100,70 Q80,90 65,60 Q50,70 30,50"
                fill="rgba(255, 255, 255, 0.4)"
              />
            </svg>
          </motion.div>
        ))}
        
        {/* Animated planes */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`plane-${i}`}
            className="absolute"
            initial={{ 
              x: "-20%", 
              y: `${15 + Math.random() * 60}%`,
              rotate: i % 2 === 0 ? -5 : 5
            }}
            animate={{
              x: "120%",
              y: [
                `${15 + Math.random() * 60}%`, 
                `${10 + Math.random() * 70}%`,
                `${15 + Math.random() * 60}%`
              ],
            }}
            transition={{
              duration: 40 + Math.random() * 80,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 15
            }}
          >
            <svg
              width={i === 0 ? 60 : 40}
              height={i === 0 ? 30 : 20}
              viewBox="0 0 60 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Plane silhouette */}
              <path
                d="M59,13 L40,8 L42,13 L10,13 L7,6 L4,8 L3,13 L1,14 L1,16 L3,17 L4,22 L7,24 L10,17 L42,17 L40,22 L59,17 L54,15 L54,15 L59,13 Z"
                fill={i === 0 ? "rgba(212, 175, 55, 0.6)" : "rgba(255, 255, 255, 0.6)"}
              />
              {/* Wing */}
              <path
                d="M25,13 L35,2 L37,2 L30,13 L25,13 Z"
                fill={i === 0 ? "rgba(212, 175, 55, 0.6)" : "rgba(255, 255, 255, 0.6)"}
              />
              {/* Tail */}
              <path
                d="M10,13 L17,5 L19,5 L14,13 L10,13 Z"
                fill={i === 0 ? "rgba(212, 175, 55, 0.6)" : "rgba(255, 255, 255, 0.6)"}
              />
            </svg>
          </motion.div>
        ))}
        
        {/* Animated contrails */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`contrail-${i}`}
            className="absolute"
            initial={{ 
              x: "-5%", 
              y: `${30 + Math.random() * 40}%`,
              opacity: 0
            }}
            animate={{
              x: "105%",
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 30 + Math.random() * 50,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 10
            }}
          >
            <svg
              width="300"
              height="2"
              viewBox="0 0 300 2"
            >
              <line
                x1="0"
                y1="1"
                x2="300"
                y2="1"
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="2"
                strokeDasharray="2 4"
              />
            </svg>
          </motion.div>
        ))}
      </div>
      
      {/* Gradient overlay to blend with the site theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
    </div>
  );
};
