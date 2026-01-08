import React, { useState, useEffect } from 'react';
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
  Snowflake,
  PaintBrush,
  Moon,
  Sun
} from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import withAuth from '@/lib/utils/withAuth';
import { getUserData, clearUserData } from '@/lib/utils/auth-utils';
import { useSnowflakes } from '@/context/SnowflakesContext';
import { useTheme, ACCENT_COLORS, BACKGROUND_COLORS } from '@/context/AccentColorContext';
import { useApiap } from '@/context/ApiapContext';
import { useLanguage } from '@/context/LanguageContext';
import { useVulcanData } from '@/lib/hooks/useVulcanData';

/**
 * Renders the user profile page.
 * This component displays user information, provides application settings
 * such as theme mode, accent color, background color, and special effects.
 * It also includes functionality for the user to log out.
 *
 * @returns {JSX.Element} The rendered profile page component within a DashboardLayout.
 */
function Profile() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showSnowflakes, setShowSnowflakes, snowflakeIntensity, setSnowflakeIntensity } = useSnowflakes();
  const {
    accentColor,
    setAccentColor,
    backgroundColor,
    setBackgroundColor,
    isDarkMode,
    toggleThemeMode
  } = useTheme();
  const { clearApiap } = useApiap();
  const [colorChanged, setColorChanged] = useState(false);
  const [bgChanged, setBgChanged] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  // Get user data from localStorage
  const { name, email } = getUserData();

  // Sample user data with dynamic values from localStorage
  // Fetch student info
  const { data: studentInfo, error: studentError, isLoading: studentLoading } = useVulcanData('student-info');

  // Sample user data with dynamic values from localStorage and API
  const userData = {
    name: (studentInfo?.firstName && studentInfo?.surname) ? `${studentInfo.firstName} ${studentInfo.surname}` :
      (studentError ? t('error.fetchingData') : (studentLoading ? '...' : (name || 'User'))),
    email: studentInfo?.email || email || 'user@example.com',
    class: studentInfo?.classDisplay || (studentError ? t('error.fetchingData') : (studentLoading ? '...' : '...')),
    school: studentInfo?.schoolName || (studentError ? t('error.fetchingData') : (studentLoading ? '...' : '...')),
    id: studentInfo?.pupilId || '...',
    unitId: '...' // unitId not exposed yet, maybe not needed for UI?
  };

  // Handle color change with feedback
  const handleColorChange = (color: string) => {
    setAccentColor(color);
    setColorChanged(true);
    setTimeout(() => setColorChanged(false), 1200);
  };

  // Handle background color change with feedback
  const handleBgChange = (color: string) => {
    setBackgroundColor(color);
    setBgChanged(true);
    setTimeout(() => setBgChanged(false), 1200);
  };

  // Filter background colors based on current theme mode
  const filteredBackgroundColors = Object.entries(BACKGROUND_COLORS).filter(([key]) => {
    const isDarkColor = ['dark', 'darker', 'navy', 'gray', 'charcoal', 'black'].includes(key);
    return isDarkMode ? isDarkColor : !isDarkColor;
  });

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
    <DashboardLayout title={t('profile_title')}>
      <div className="space-y-6 theme-transition">
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
                    <span>{t('profile_class')} {userData.class}</span>
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
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70"
            >
              <SignOut size={20} className="mr-2" />
              {isLoggingOut ? t('logging_out') : t('log_out')}
            </button>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(Profile);