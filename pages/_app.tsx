import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { QueryClient, QueryClientProvider } from 'react-query';
import { ApiapProvider } from '@/context/ApiapContext';
import { SnowflakesProvider } from '@/context/SnowflakesContext';
import { ThemeProvider } from '@/context/AccentColorContext';
import Snowflakes from '@/components/effects/Snowflakes';
import ErrorBoundary from '@/components/ErrorBoundary';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    __NAVIGATING_AWAY?: boolean;
  }
}

// Создаем клиент для react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Create a global error handler for navigation errors
if (typeof window !== 'undefined') {
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    // If it's a component unmount error, suppress it
    if (
      message === 'Component unmounted' || 
      (typeof message === 'string' && message.includes('unmounted')) ||
      (error && error.message && error.message.includes('unmounted'))
    ) {
      console.log('Global handler suppressed unmount error');
      return true; // Prevents the error from propagating
    }
    
    // Otherwise, pass it to the original handler
    return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
  };
}

export default function App({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, (err) => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
    
    // Set up a cleanup function that runs before page unload
    // to prevent "component unmounted" errors
    const handleBeforeUnload = () => {
      // Set a flag that indicates we're navigating away
      window.__NAVIGATING_AWAY = true;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ApiapProvider>
          <ThemeProvider>
            <SnowflakesProvider>
              <Snowflakes />
              <AnimatePresence mode="wait" initial={true}>
                <Component {...pageProps} key={router.route} />
              </AnimatePresence>
              <Analytics />
              <SpeedInsights />
            </SnowflakesProvider>
          </ThemeProvider>
        </ApiapProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
