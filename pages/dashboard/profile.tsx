import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { 
  User,
  Envelope,
  Building,
  IdentificationCard,
  BookOpen,
  Gift,
  SignOut,
  UserCircle,
  EnvelopeSimple,
  GraduationCap,
  Buildings,
  Snowflake
} from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import withAuth from '@/lib/utils/withAuth';
import { getUserData, clearUserData } from '@/lib/utils/auth-utils';
import { useSnowflakes } from '@/context/SnowflakesContext';
import { useApiap } from '@/context/ApiapContext';

function Profile() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showSnowflakes, setShowSnowflakes, snowflakeIntensity, setSnowflakeIntensity } = useSnowflakes();
  const { clearApiap } = useApiap();
  
  // Get user data from localStorage
  const { name, email } = getUserData();
  
  // Sample user data with dynamic values from localStorage
  const userData = {
    name: name || 'User',
    email: email || 'user@example.com',
    class: 'ZSE-I',
    school: 'Lodz',
    id: '3dc57ed0-9668-402e-82e9-53c0da5f8aba',
    unitId: '67b10649-9dce-4738-9a32-88e3c7c1ec88'
  };

  const handleLogout = () => {
    try {
      setIsLoggingOut(true);
      
      // First clear the APIAP context to release memory
      clearApiap();
      
      // Then clear localStorage
      clearUserData();
      
      // Simple redirect instead of the complex approach
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback if the normal logout fails
      window.location.href = '/';
    }
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
                {userData.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold mb-2">{userData.name}</h2>
                <div className="text-text-secondary space-y-1">
                  <div className="flex items-center justify-center sm:justify-start">
                    <Envelope size={16} className="mr-2" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <BookOpen size={16} className="mr-2" />
                    <span>Class {userData.class}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <Building size={16} className="mr-2" />
                    <span>{userData.school}</span>
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
            <h3 className="text-lg font-mono font-bold mb-4">App Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Snowflake size={20} className="mr-2 text-blue-400" />
                    <span>Snowflakes Effect</span>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={showSnowflakes}
                      onChange={(e) => setShowSnowflakes(e.target.checked)}
                    />
                    <div className="relative w-11 h-6 bg-surface rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                {showSnowflakes && (
                  <div className="pt-2">
                    <label htmlFor="snowflake-intensity" className="block mb-2 text-sm font-medium">
                      Snowflake Intensity: {snowflakeIntensity}%
                    </label>
                    <input
                      id="snowflake-intensity"
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={snowflakeIntensity}
                      onChange={(e) => setSnowflakeIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
                  {userData.id}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-surface rounded-lg">
                <div className="flex items-center">
                  <Building size={16} className="mr-2 text-primary" />
                  <span>School ID</span>
                </div>
                <div className="text-text-secondary font-mono bg-background px-2 py-1 rounded text-xs overflow-x-auto max-w-[200px] whitespace-nowrap">
                  {userData.unitId}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-surface rounded-lg">
                <div className="flex items-center">
                  <Gift size={16} className="mr-2 text-primary" />
                  <span>App Version</span>
                </div>
                <div className="text-text-secondary font-mono">1.3.9</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Credits</h3>
            <div className="flex">
                <p>
                    This app is made by <a className="text-blue-500" href="https://github.com/0xhkamori" target="_blank" rel="noopener noreferrer">0xhkamori</a>
                    <br />
                    You can find the source code <a className="text-blue-500" href="https://github.com/0xhkamori/darktide" target="_blank" rel="noopener noreferrer">here</a>
                    <br />
                </p> 
            </div>
          </Card>
        </motion.div>

        <div className="text-center text-text-secondary text-xs mt-8 mb-4">
          <p>Dark Tide © 2025</p>
          <p className="mt-1">Made with ♥ for students</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70"
            >
              <SignOut size={20} className="mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </button>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(Profile); 
