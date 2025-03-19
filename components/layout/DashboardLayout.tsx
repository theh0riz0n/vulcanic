import React, { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background pb-20">
      {title && (
        <header className="sticky top-0 z-40 blur-backdrop py-4 shadow-sm">
          <div className="max-w-screen-lg mx-auto px-4">
            <h1 className="text-2xl font-mono font-bold text-text-primary">{title}</h1>
          </div>
        </header>
      )}
      
      <motion.main 
        className="flex-grow flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.2,
          ease: "easeInOut"
        }}
      >
        <div className="max-w-screen-lg mx-auto px-4 py-4 w-full">
          {children}
        </div>
      </motion.main>
      
      <BottomNavigation />
    </div>
  );
};

export default DashboardLayout; 