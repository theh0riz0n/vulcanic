
import { useState, useEffect } from 'react';

const LAST_SEEN_VERSION_KEY = 'vulcanic-last-seen-version';

export function useWhatsNew() {
  const [showModal, setShowModal] = useState(false);
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0';
  const changelog = process.env.NEXT_PUBLIC_LATEST_COMMIT_MESSAGE || 'No changes to display.';

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);

    if (lastSeenVersion !== appVersion) {
      setShowModal(true);
    }
  }, [appVersion]);

  const handleClose = () => {
    setShowModal(false);
    localStorage.setItem(LAST_SEEN_VERSION_KEY, appVersion);
  };

  return {
    showModal,
    handleClose,
    appVersion,
    changelog,
  };
}
