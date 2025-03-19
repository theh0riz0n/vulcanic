import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  Calendar,
  GraduationCap,
  House,
  Notepad,
  ClockCounterClockwise,
  User
} from '@phosphor-icons/react';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: House },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Grades', href: '/dashboard/grades', icon: GraduationCap },
  { name: 'Homework', href: '/dashboard/homework', icon: Notepad },
  { name: 'Attendance', href: '/dashboard/attendance', icon: ClockCounterClockwise },
  { name: 'Profile', href: '/dashboard/profile', icon: User }
];

const BottomNavigation: React.FC = () => {
  const router = useRouter();

  // Log current path for debugging
  React.useEffect(() => {
    console.log('Current path:', router.pathname);
  }, [router.pathname]);

  // Handle navigation manually to avoid blank pages
  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    // Force a hard navigation instead of client-side navigation
    window.location.href = href;
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