import React, { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from './BottomNavigation';
import SideNavigation from './SideNavigation';
import axios from 'axios';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasSubstitutions, setHasSubstitutions] = useState(false);
  
  // Listen for navigation events
  useEffect(() => {
    const handleBeforeNavigate = () => {
      setIsNavigating(true);
    };
    
    // Try to detect navigation
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeNavigate);
      
      // For SPA navigation
      const originalPushState = window.history.pushState.bind(window.history);
      window.history.pushState = function() {
        handleBeforeNavigate();
        return originalPushState.apply(this, arguments as any);
      };
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeNavigate);
        window.history.pushState = originalPushState;
      };
    }
    
    return undefined;
  }, []);

  // Check for substitutions
  useEffect(() => {
    const checkTodaySubstitutions = async () => {
      try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        const response = await axios.get(`/api/vulcan/substitutions?startDate=${dateStr}&endDate=${dateStr}`);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setHasSubstitutions(true);
        } else {
          setHasSubstitutions(false);
        }
      } catch (error) {
        console.error('Error checking substitutions:', error);
        setHasSubstitutions(false);
      }
    };
    
    checkTodaySubstitutions();
  }, []);
  
  // Hide any errors that occur during navigation
  useEffect(() => {
    // Add global error handler
    const handleError = (event: Event) => {
      // Type guard to check if it's an ErrorEvent
      if (
        isNavigating && 
        event instanceof ErrorEvent && 
        event.message === 'Component unmounted'
      ) {
        // Prevent the error from being shown to the user
        event.preventDefault();
        console.log('Suppressed "Component unmounted" error during navigation');
        return true;
      }
      return false;
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleError);
      
      return () => {
        window.removeEventListener('error', handleError);
      };
    }
    
    return undefined;
  }, [isNavigating]);
  
  return (
    <div className="min-h-screen flex flex-col bg-background md:pl-20 pb-20 md:pb-0">
      {/* Side Navigation for Desktop */}
      <div className="hidden md:block">
        <SideNavigation hasSubstitutions={hasSubstitutions} />
      </div>

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
          {!isNavigating && children}
        </div>
      </motion.main>
      
      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default DashboardLayout;