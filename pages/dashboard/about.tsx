
import React from 'react';
import Card from '@/components/ui/Card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  IdentificationCard,
  Gift,
  UserCircle,
  EnvelopeSimple,
  GraduationCap,
  Buildings,
  Code,
  Heart,
  GithubLogo
} from '@phosphor-icons/react';
import { getUserData } from '@/lib/utils/auth-utils';

const About: React.FC = () => {
  const userData = {
    id: 'N/A',
    unitId: 'N/A'
  };

  return (
    <DashboardLayout title="About">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-mono font-bold mb-4 flex items-center">
              <Code size={22} className="mr-2 text-primary" />
              Technical Data
            </h3>
            <div className="text-sm text-text-secondary space-y-2 font-mono">
              <div className="flex items-center">
                <IdentificationCard size={16} className="mr-2" />
                <span>User ID: {userData.id}</span>
              </div>
              <div className="flex items-center">
                <Buildings size={16} className="mr-2" />
                <span>Unit ID: {userData.unitId}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-mono font-bold mb-4 flex items-center">
              <Heart size={22} className="mr-2 text-primary" />
              Credits
            </h3>
            <div className="text-sm text-text-secondary space-y-4">
              <p>
                This app was created with love for students who want a better experience.
              </p>
              <div className="flex items-center">
                <UserCircle size={16} className="mr-2" />
                <span>Created by: vulcanic</span>
              </div>
              <div className="flex items-center">
                <EnvelopeSimple size={16} className="mr-2" />
                <span>Contact: vulcanic@gmail.com</span>
              </div>
              <div className="flex items-center">
                <GithubLogo size={16} className="mr-2" />
                <a 
                  href="https://github.com/vulcanic" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  github.com/vulcanic
                </a>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default About;
