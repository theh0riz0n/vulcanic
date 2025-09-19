
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { navItems } from './navItems';
import { SignOut } from '@phosphor-icons/react';
import { clearUserData } from '@/lib/utils/auth-utils';
import { useApiap } from '@/context/ApiapContext';

interface SideNavigationProps {
  hasSubstitutions: boolean;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ hasSubstitutions }) => {
  const router = useRouter();
  const { clearApiap } = useApiap();

  const handleLogout = () => {
    try {
      clearApiap();
      clearUserData();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/';
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-20 bg-background-secondary flex flex-col items-center py-4 shadow-lg z-50">
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
            return (
              <li key={item.name} className="relative">
                <Link href={item.href} legacyBehavior>
                  <a className={`nav-item ${isActive ? 'active' : ''}`}>
                    <div className={`icon-container ${isActive ? 'active' : ''}`}>
                      <item.icon size={28} weight={isActive ? "fill" : "regular"} />
                      {item.checkSubstitutions && hasSubstitutions && !isActive && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-warning rounded-full border-2 border-background-secondary"></span>
                      )}
                    </div>
                    <span className="text-xs mt-1 font-medium">{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto">
        <button onClick={handleLogout} className="nav-item text-text-secondary hover:text-text-primary">
          <SignOut size={28} />
          <span className="text-xs mt-1 font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SideNavigation;
