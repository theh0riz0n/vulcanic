import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import {
  User,
  Envelope,
  Backpack,
  ClockCounterClockwise,
  Gear,
  Info,
  SignOut,
  CaretRight
} from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import withAuth from '@/lib/utils/withAuth';
import { clearUserData } from '@/lib/utils/auth-utils';
import { useApiap } from '@/context/ApiapContext';
import { useLanguage } from '@/context/LanguageContext';

function More() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { clearApiap } = useApiap();
  const { t } = useLanguage();

  const handleLogout = () => {
    try {
      setIsLoggingOut(true);
      clearApiap();
      clearUserData();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/';
    }
  };

  const menuItems = {
    main: [
      {
        icon: Backpack,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        title: t('nav.homework'),
        description: t('more.homework.desc'),
        href: '/dashboard/homework'
      },
      {
        icon: ClockCounterClockwise,
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10',
        title: t('nav.attendance'),
        description: t('more.attendance.desc'),
        href: '/dashboard/attendance'
      },
      {
        icon: Envelope,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        title: t('nav.messages'),
        description: t('more.messages.desc'),
        href: '/dashboard/messages'
      },
      {
        icon: User,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        title: t('nav.profile'),
        description: t('more.profile.desc'),
        href: '/dashboard/profile'
      }
    ],
    other: [
      {
        icon: Gear,
        color: 'text-gray-400',
        bgColor: 'bg-gray-400/10',
        title: t('settings.title'),
        description: t('more.settings.desc'),
        href: '/dashboard/settings'
      },
      {
        icon: Info,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        title: 'About', // Using hardcoded or need a key? about.tsx uses "About". 'nav.about' doesnt exist but 'profile_title' was used. I'll use hardcoded or t('settings.appSettings')? No, 'About' page. Let's use hardcoded "About" or add key. En.json had 'About' in body. I'll use "About" but `t('more.about.desc')` exists.
        // Wait, looking at en.json, line 20: "profile_title": "Profile". 
        // I will just use "About" string for title as existing about.tsx uses explicit string. Or I can use t('nav.more') but that's More.
        // Actually, about.tsx uses Title="About".
        description: t('more.about.desc'),
        href: '/dashboard/about'
      }
    ]
  };

  const MenuItem = ({ item, onClick }: { item: any, onClick?: () => void }) => (
    <div
      onClick={onClick || (() => router.push(item.href))}
      className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors active:bg-white/10"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
          <item.icon size={20} className={item.color} weight="fill" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">{item.title}</h3>
          <p className="text-xs text-text-secondary">{item.description}</p>
        </div>
      </div>
      <CaretRight size={16} className="text-text-secondary" />
    </div>
  );

  return (
    <DashboardLayout title={t('nav.more')}>
      <div className="space-y-6 pb-6"> {/* Added pb-6 for bottom spacing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-3 px-1">{t('more.mainFeatures')}</h2>
          <Card className="overflow-hidden divide-y divide-border">
            {menuItems.main.map((item, index) => (
              <MenuItem key={index} item={item} />
            ))}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-3 px-1">{t('more.other')}</h2>
          <Card className="overflow-hidden divide-y divide-border">
            {menuItems.other.map((item, index) => (
              <MenuItem key={index} item={item} />
            ))}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <div
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-red-500/10 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <SignOut size={20} className="text-red-500" weight="fill" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-500">{isLoggingOut ? t('logging_out') : t('logout')}</h3>
                  <p className="text-xs text-red-400/70">{t('more.signout.desc')}</p>
                </div>
              </div>
              <CaretRight size={16} className="text-red-400 group-hover:text-red-500" />
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(More);
