import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  Calendar,
  GraduationCap,
  House,
  Notepad,
  ClockCounterClockwise,
  User,
  Warning
} from '@phosphor-icons/react';
import axios from 'axios';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: House },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar, checkSubstitutions: true },
  { name: 'Grades', href: '/dashboard/grades', icon: GraduationCap },
  { name: 'Homework', href: '/dashboard/homework', icon: Notepad },
  { name: 'Attendance', href: '/dashboard/attendance', icon: ClockCounterClockwise },
  { name: 'Profile', href: '/dashboard/profile', icon: User }
];

const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const [hasSubstitutions, setHasSubstitutions] = useState(false);

  // Log current path for debugging
  useEffect(() => {
    console.log('Current path:', router.pathname);
  }, [router.pathname]);

  // Check if there are substitutions for today
  useEffect(() => {
    const checkTodaySubstitutions = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const response = await axios.get(`/api/vulcan/substitutions?startDate=${dateStr}&endDate=${dateStr}`);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log('Found substitutions for today:', response.data.length);
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

  // Handle navigation safely
  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Safety check - if already on this page, don't navigate
    if (router.pathname === href) {
      return;
    }
    
    // Wrap in try/catch to prevent any errors during navigation
    try {
      // Add a class to the body to indicate navigation is in progress
      if (typeof document !== 'undefined') {
        document.body.classList.add('navigating');
      }
      
      // Disable error reporting during navigation
      const originalOnError = window.onerror;
      window.onerror = (message) => {
        if (message === 'Component unmounted' || String(message).includes('unmounted')) {
          console.log('Suppressed navigation error:', message);
          return true;
        }
        return false;
      };
      
      // Use location.href for a cleaner navigation without client-side routing
      window.location.href = href;
      
      // Restore error handling after a delay (just in case navigation didn't complete)
      setTimeout(() => {
        window.onerror = originalOnError;
      }, 1000);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback
      window.location.href = href;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 blur-backdrop py-1 shadow-elevation">
      <nav className="max-w-screen-lg mx-auto px-2">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => {
            // Определить активность пути более гибко
            const isActive = router.pathname === item.href || 
                             (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
            
            return (
              <li key={item.name} className="relative">
                <a 
                  href={item.href}
                  className={`nav-item flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-text-secondary'}`}
                  onClick={handleNavigation(item.href)}
                >
                  <span className="relative">
                    <item.icon 
                      size={24} 
                      weight={isActive ? "fill" : "regular"}
                    />
                    
                    {/* Show notification indicator for substitutions */}
                    {item.checkSubstitutions && hasSubstitutions && !isActive && (
                      <span className="absolute -top-1 -right-2 w-2 h-2 bg-warning rounded-full"></span>
                    )}
                    
                    {isActive && (
                      <motion.span
                        className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full"
                        layoutId="bottomNavIndicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </span>
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default BottomNavigation; 