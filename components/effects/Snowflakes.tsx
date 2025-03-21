import React, { useEffect, useRef } from 'react';
import { useSnowflakes } from '@/context/SnowflakesContext';
import styles from './Snowflakes.module.css';

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  sin: number;
  sinStep: number;
}

const Snowflakes: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { showSnowflakes, snowflakeIntensity, isSnowflakesLoaded } = useSnowflakes();
  const snowflakesRef = useRef<Snowflake[]>([]);
  const animationRef = useRef<number>(0);

  // Calculate number of snowflakes based on intensity
  const getSnowflakeCount = () => {
    const baseCount = 30;
    return Math.floor(baseCount * (snowflakeIntensity / 50));
  };

  // Initialize canvas and animation
  useEffect(() => {
    if (!showSnowflakes || !isSnowflakesLoaded) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reinitialize snowflakes when resizing
      initSnowflakes();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Initialize snowflakes
    function initSnowflakes() {
      if (!canvas) return;
      const count = getSnowflakeCount();
      snowflakesRef.current = [];

      for (let i = 0; i < count; i++) {
        snowflakesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 1 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          sin: Math.random() * 10,
          sinStep: Math.random() * 0.02 + 0.01
        });
      }
    }

    // Animation loop
    function animate() {
      if (!canvas || !ctx || !showSnowflakes) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "#fff";
      
      snowflakesRef.current.forEach(flake => {
        ctx.globalAlpha = flake.opacity;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Update position
        flake.y += flake.speed;
        flake.x += Math.sin(flake.sin) * 0.5;
        flake.sin += flake.sinStep;
        
        // Reset if out of bounds
        if (flake.y > canvas.height) {
          flake.y = -5;
          flake.x = Math.random() * canvas.width;
        }
      });
      
      animationRef.current = requestAnimationFrame(animate);
    }

    initSnowflakes();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [showSnowflakes, snowflakeIntensity, isSnowflakesLoaded]);

  if (!isSnowflakesLoaded) return null;
  if (!showSnowflakes) return null;

  return (
    <canvas
      ref={canvasRef}
      className={styles.snowflakeCanvas}
    />
  );
};

export default Snowflakes; 