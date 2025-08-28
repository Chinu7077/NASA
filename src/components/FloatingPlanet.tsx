'use client';

import { motion } from 'framer-motion';

interface FloatingPlanetProps {
  size: number;
  color: string;
  duration: number;
  delay: number;
  x: number;
  y: number;
}

export const FloatingPlanet = ({ size, color, duration, delay, x, y }: FloatingPlanetProps) => {
  return (
    <motion.div
      className="absolute rounded-full opacity-20"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color}, rgba(0,0,0,0.3))`,
        left: `${x}%`,
        top: `${y}%`,
        filter: 'blur(1px)',
      }}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        rotate: [0, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};