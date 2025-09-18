
import React, { useState, useEffect } from 'react';
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
import WhatsNewModal from '@/components/ui/WhatsNewModal';

const About: React.FC = () => {
  const [userData, setUserData] = useState({ id: 'N/A', unitId: 'N/A' });
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);

  useEffect(() => {
    const data = getUserData();
    if (data) {
      setUserData({
        id: data.email || 'N/A',
        unitId: 'N/A', // unitId is not available in user data
      });
    }
  }, []);

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0';
  const changelog = process.env.NEXT_PUBLIC_LATEST_COMMIT_MESSAGE || 'No changes to display.';

  return (
    <DashboardLayout title="About">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-mono font-bold mb-4 flex items-center">
              <Gift size={22} className="mr-2 text-primary" />
              What's New
            </h3>
            <div className="text-sm text-text-secondary space-y-2">
              <p>Current version: {appVersion}</p>
              <button
                onClick={() => setIsWhatsNewOpen(true)}
                className="font-semibold text-primary hover:underline"
              >
                View latest changes
              </button>
            </div>
          </Card>
        </motion.div>

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
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => setIsWhatsNewOpen(false)}
        version={appVersion}
        changelog={changelog}
      />
    </DashboardLayout>
  );
};

export default About;
