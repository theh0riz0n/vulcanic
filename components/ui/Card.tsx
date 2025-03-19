import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  withHover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  withHover = true
}) => {
  return (
    <motion.div
      className={`card ${withHover ? 'hover:shadow-elevation hover:-translate-y-1' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      whileHover={withHover ? { scale: 1.02 } : undefined}
      whileTap={withHover ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  );
};

export default Card; 