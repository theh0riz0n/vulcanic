"use client";

import { useWhatsNew } from '@/lib/hooks/useWhatsNew';
import WhatsNewModal from '../ui/WhatsNewModal';

export default function WhatsNewClient() {
  const { showModal, handleClose, appVersion, changelog } = useWhatsNew();

  if (!showModal) {
    return null;
  }

  return (
    <WhatsNewModal
      isOpen={showModal}
      onClose={handleClose}
      version={appVersion}
      changelog={changelog}
    />
  );
}