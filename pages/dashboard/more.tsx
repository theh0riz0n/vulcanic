
import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import {
  Notepad,
  ClockCounterClockwise,
  User,
  Gear,
  SignOut,
  Info,
  CaretRight
} from '@phosphor-icons/react';

const More: React.FC = () => {
  const menuItems = [
    {
      title: 'Homework',
      description: 'View and manage your assignments',
      icon: Notepad,
      href: '/dashboard/homework',
      color: 'bg-green-500'
    },
    {
      title: 'Attendance',
      description: 'Check your attendance records',
      icon: ClockCounterClockwise,
      href: '/dashboard/attendance',
      color: 'bg-secondary'
    },
    {
      title: 'Profile',
      description: 'Manage your account settings',
      icon: User,
      href: '/dashboard/profile',
      color: 'bg-primary'
    }
  ];

  const otherItems = [
    {
      title: 'Settings',
      description: 'App preferences and configuration',
      icon: Gear,
      href: '/dashboard/settings',
      color: 'bg-gray-500'
    },
    {
      title: 'About',
      description: 'App information and version',
      icon: Info,
      href: '/dashboard/about',
      color: 'bg-blue-500'
    }
  ];

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('vulcanData');
    localStorage.removeItem('apiap');
    localStorage.removeItem('userData');
    
    // Redirect to login
    window.location.href = '/';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-mono font-bold mb-6">More</h1>
          
          {/* Main Menu Items */}
          <div className="space-y-3 mb-8">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Main Features</h2>
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <Card className="p-4 hover:bg-surface-hover transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center`}>
                          <item.icon size={24} weight="bold" className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-text-primary">{item.title}</h3>
                          <p className="text-sm text-text-secondary">{item.description}</p>
                        </div>
                      </div>
                      <CaretRight size={20} className="text-text-tertiary" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Other Items */}
          <div className="space-y-3 mb-8">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Other</h2>
            {otherItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: (menuItems.length + index) * 0.1 }}
              >
                <Link href={item.href}>
                  <Card className="p-4 hover:bg-surface-hover transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center`}>
                          <item.icon size={24} weight="bold" className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-text-primary">{item.title}</h3>
                          <p className="text-sm text-text-secondary">{item.description}</p>
                        </div>
                      </div>
                      <CaretRight size={20} className="text-text-tertiary" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card 
              className="p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border-red-200 dark:border-red-800"
              onClick={handleLogout}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                    <SignOut size={24} weight="bold" className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-600 dark:text-red-400">Sign Out</h3>
                    <p className="text-sm text-red-500 dark:text-red-500">Log out of your account</p>
                  </div>
                </div>
                <CaretRight size={20} className="text-red-400" />
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default More;
