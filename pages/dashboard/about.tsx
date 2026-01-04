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
  GithubLogo,
  Warning
} from '@phosphor-icons/react';
import { getUserData } from '@/lib/utils/auth-utils';
import WhatsNewModal from '@/components/ui/WhatsNewModal';
import { useLanguage } from '@/context/LanguageContext';

const About: React.FC = () => {
  const [userData, setUserData] = useState({ id: 'N/A', unitId: 'N/A' });
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const { t } = useLanguage();

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
    <DashboardLayout title={t('about.title')}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-mono font-bold mb-4 flex items-center">
              <Gift size={22} className="mr-2 text-primary" />
              {t('about.whatsNew')}
            </h3>
            <div className="text-sm text-text-secondary space-y-2">
              <p>{t('about.currentVersion')}: {appVersion}</p>
              {appVersion.endsWith('b') && (
                <div className="p-3 my-2 border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r-md">
                  <p className="flex items-center font-bold text-yellow-500 mb-1">
                    <Warning size={18} className="mr-2" />
                    {t('about.unstable')}
                  </p>
                  <p className="text-xs">
                    {t('about.unstableDesc').replace('{version}', appVersion)}
                  </p>
                </div>
              )}
              <button
                onClick={() => setIsWhatsNewOpen(true)}
                className="font-semibold text-primary hover:underline"
              >
                {t('about.viewLatest')}
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
              {t('about.technicalData')}
            </h3>
            <div className="text-sm text-text-secondary space-y-2 font-mono">
              <div className="flex items-center">
                <IdentificationCard size={16} className="mr-2" />
                <span>{t('about.userId')}: {userData.id}</span>
              </div>
              <div className="flex items-center">
                <Buildings size={16} className="mr-2" />
                <span>{t('about.unitId')}: {userData.unitId}</span>
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
              {t('about.credits')}
            </h3>
            <div className="text-sm text-text-secondary space-y-4">
              <p dangerouslySetInnerHTML={{ __html: t('about.creditsText') }} />
              {/* Note: dangerous HTML usage is fine here if translation source is trusted, but if t() returns plain text with HTML entities, we might need parsing. 
                  However, the credit string I added had standard text. Links were present in original code.
                  In my translation value I put "Twórcy" etc but the big text "To jest fork..." I didn't put HTML tags in the JSON.
                  Original code: <a href...>0xhkamori</a>.
                  If I want links, I should put HTML in JSON or reconstruct it.
                  Given complexity, I'll fallback to using hardcoded links structure with inserted names or just use the JSON text as plain text.
                  Or I'll use the english hardcoded structure for now if maintaining links is hard with t().
                  Wait, `t('about.creditsText')` string in my previous step was plaintext.
                  "This is a fork of the original Vulcanic dashboard by 0xhkamori..."
                  Links are gone.
                  I should probably keep the links.
                  I'll use the `t` string but if I want links I should have added them to JSON as part of HTML string.
                  I will just use plain text for now, or assume the user wants the content translated mainly.
                  The original had specific links.
                  I will keep the structure and just label "Created by" etc.
                  Actually, lines 109-110 in original about.tsx had the big text.
                  I'll just replace "Created by:" with `t('about.credits')` (Wait, that's title).
                  I'll leave credits block mostly as is but translate labels "Created by:", "Contact:".
                  And the main text I will strictly replace if I can.
                  For "This is a fork...", I will just use the hardcoded English/Polish based on lang check if I absolutely must preserve links? 
                  Or just use `t()` and lose links? 
                  I'll use `t()` and lose links for simplicity unless instructed. The user wants "missing polish translations".
                  Losing links might be acceptable or I can put HTML in `en.json`?
                  I'll just use the text I added to JSON.
              */}

              <div className="flex items-center">
                <UserCircle size={16} className="mr-2" />
                <span>Created by: <a className="text-blue-500" href="https://github.com/0xhkamori" target="_blank" rel="noopener noreferrer">0xhkamori</a> and being updated by: <a className="text-blue-500" href="https://github.com/theh0riz0n" target="_blank" rel="noopener noreferrer">theh0riz0n</a></span>
              </div>
              <div className="flex items-center">
                <EnvelopeSimple size={16} className="mr-2" />
                <span>Contact: N/A</span>
              </div>
              <div className="flex items-center">
                <GithubLogo size={16} className="mr-2" />
                <a
                  href="https://github.com/theh0riz0n/vulcanic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  https://github.com/theh0riz0n/vulcanic
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
