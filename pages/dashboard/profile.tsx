import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { 
  User,
  Envelope,
  Building,
  IdentificationCard,
  BookOpen,
  Gift
} from '@phosphor-icons/react';

export default function Profile() {
  // User information (in a real app, this should be fetched from API)
  const userInfo = {
    name: 'Maksym Morykon',
    email: 'artemka141008.9@gmail.com',
    class: 'ZSE-I',
    school: 'Lodz',
    id: '3dc57ed0-9668-402e-82e9-53c0da5f8aba',
    unitId: '67b10649-9dce-4738-9a32-88e3c7c1ec88'
  };

  return (
    <DashboardLayout title="Profile">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                {userInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold mb-2">{userInfo.name}</h2>
                <div className="text-text-secondary space-y-1">
                  <div className="flex items-center justify-center sm:justify-start">
                    <Envelope size={16} className="mr-2" />
                    <span>{userInfo.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <BookOpen size={16} className="mr-2" />
                    <span>Class {userInfo.class}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <Building size={16} className="mr-2" />
                    <span>{userInfo.school}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-mono font-bold mb-4">Technical Data</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-surface rounded-lg">
                <div className="flex items-center">
                  <IdentificationCard size={16} className="mr-2 text-primary" />
                  <span>User ID</span>
                </div>
                <div className="text-text-secondary font-mono bg-background px-2 py-1 rounded text-xs overflow-x-auto max-w-[200px] whitespace-nowrap">
                  {userInfo.id}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-surface rounded-lg">
                <div className="flex items-center">
                  <Building size={16} className="mr-2 text-primary" />
                  <span>School ID</span>
                </div>
                <div className="text-text-secondary font-mono bg-background px-2 py-1 rounded text-xs overflow-x-auto max-w-[200px] whitespace-nowrap">
                  {userInfo.unitId}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-surface rounded-lg">
                <div className="flex items-center">
                  <Gift size={16} className="mr-2 text-primary" />
                  <span>App Version</span>
                </div>
                <div className="text-text-secondary font-mono">1.0.0</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="text-center text-text-secondary text-xs mt-8 mb-4">
          <p>Dark Tide © 2025</p>
          <p className="mt-1">Made with ♥ for students</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 