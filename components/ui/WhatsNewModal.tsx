
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from '@phosphor-icons/react';
import Card from './Card';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
  changelog: string;
}

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose, version, changelog }) => {
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
            className="relative w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-6 bg-background border border-surface">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-primary/20 text-primary mr-4">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">What's New</h2>
                    <p className="text-sm text-text-secondary">Version {version}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-surface"
                  aria-label="Close what's new dialog"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                <h3 className="font-semibold text-text-primary">Recent Changes:</h3>
                <div 
                  className="prose prose-sm prose-invert text-text-secondary whitespace-pre-wrap"
                  style={{ 
                    // @ts-ignore
                    '--tw-prose-bullets': 'var(--primary)',
                  }}
                >
                  {changelog.split('\n').map((line, index) => {
                    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                      return <li key={index} className="ml-4">{line.trim().substring(1).trim()}</li>;
                    }
                    return <p key={index}>{line}</p>;
                  })}
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 font-semibold text-white transition-colors rounded-md bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background"
                >
                  Got it!
                </button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsNewModal;
