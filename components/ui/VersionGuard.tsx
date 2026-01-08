import React, { useState, useEffect } from 'react';
import WhatsNewModal from './WhatsNewModal';

const VersionGuard: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0';
    const changelog = process.env.NEXT_PUBLIC_LATEST_COMMIT_MESSAGE || 'No changes to display.';

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedVersion = localStorage.getItem('app_version');

            // If version is different and not the very first run (where storedVersion is null)
            // Or if you want to show it even on first run, remove the storedVersion null check.
            // User said "after the version change", implying it should have been set before.
            if (storedVersion && storedVersion !== currentVersion) {
                setIsOpen(true);
            }

            // Update the version in storage
            localStorage.setItem('app_version', currentVersion);
        }
    }, [currentVersion]);

    return (
        <WhatsNewModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            version={currentVersion}
            changelog={changelog}
        />
    );
};

export default VersionGuard;
