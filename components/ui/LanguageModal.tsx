
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { X, CheckCircle } from '@phosphor-icons/react';
import { useLanguage } from '@/context/LanguageContext';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lang: 'en' | 'pl') => void;
  currentLanguage: 'en' | 'pl';
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'pl', name: 'Polski' },
] as const;

const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose, onSelect, currentLanguage }) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative w-full max-w-xs mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-4 bg-background border border-surface">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">{t('settings.language')}</h2>
                <button
                  onClick={onClose}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-surface"
                  aria-label="Close language selection"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelect(lang.code);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                      currentLanguage === lang.code
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-surface text-text-primary'
                    }`}
                  >
                    <span>{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <CheckCircle size={20} weight="fill" className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanguageModal;
