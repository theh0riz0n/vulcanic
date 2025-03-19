import React from 'react';
import { motion } from 'framer-motion';

// Define the allowed color types based on colorMap keys
type LoadingColor = keyof typeof colorMap;

// Update the colorMap
const colorMap = {
  primary: 'border-primary',
  accent: 'border-accent',
  white: 'border-white',
};

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: LoadingColor;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Loading...' 
}) => {
  // Size definitions based on size prop
  const sizeMap = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        className={`rounded-full border-2 border-t-transparent ${sizeMap[size]} ${colorMap[color]}`}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear"
        }}
      />
      {text && (
        <p className="mt-2 text-text-secondary font-mono text-sm">{text}</p>
      )}
    </div>
  );
};

export default Loading; 