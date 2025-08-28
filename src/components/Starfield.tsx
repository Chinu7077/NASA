'use client';

import { useEffect, useRef } from 'react';

export const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star configuration
    const stars: Array<{
      x: number;
      y: number;
      z: number;
      px: number;
      py: number;
      size: number;
      brightness: number;
    }> = [];

    const numStars = 800;
    const speed = 0.5;

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        z: Math.random() * 1000,
        px: 0,
        py: 0,
        size: Math.random() * 2 + 1,
        brightness: Math.random() * 0.5 + 0.5,
      });
    }

    // Animation loop
    const animate = () => {
      // Clear canvas with background
      ctx.fillStyle = 'rgba(23, 23, 40, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      stars.forEach((star) => {
        try {
          star.z -= speed;

          if (star.z <= 0) {
            star.x = Math.random() * 2000 - 1000;
            star.y = Math.random() * 2000 - 1000;
            star.z = 1000;
          }

          // Calculate screen position
          star.px = (star.x / star.z) * centerX + centerX;
          star.py = (star.y / star.z) * centerY + centerY;

          // Check if star is visible on screen
          if (
            star.px >= 0 &&
            star.px <= canvas.width &&
            star.py >= 0 &&
            star.py <= canvas.height &&
            star.z > 0
          ) {
            // Calculate size and opacity with proper bounds
            const zRatio = Math.max(0, Math.min(1, 1 - star.z / 1000));
            const size = Math.max(0.5, zRatio * star.size);
            const opacity = Math.max(0.1, Math.min(1, zRatio * star.brightness));

            // Validate all values before rendering
            if (
              !isNaN(star.px) && 
              !isNaN(star.py) && 
              !isNaN(size) && 
              !isNaN(opacity) &&
              opacity > 0 &&
              size > 0
            ) {
              // Use simple circle rendering instead of gradient to avoid color errors
              ctx.fillStyle = `rgba(150, 200, 255, ${opacity.toFixed(3)})`;
              ctx.beginPath();
              ctx.arc(star.px, star.py, size, 0, Math.PI * 2);
              ctx.fill();

              // Add glow effect with simple shadow
              if (opacity > 0.5) {
                ctx.shadowColor = `rgba(100, 150, 255, ${(opacity * 0.5).toFixed(3)})`;
                ctx.shadowBlur = size * 2;
                ctx.beginPath();
                ctx.arc(star.px, star.py, size * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
              }
            }
          }
        } catch (error) {
          // Skip this star if any error occurs
          console.warn('Star rendering error:', error);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="starfield fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};