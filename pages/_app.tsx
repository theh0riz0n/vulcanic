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
import Snowflakes from '@/components/effects/Snowflakes';

// Создаем клиент для react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiapProvider>
        <SnowflakesProvider>
          <Snowflakes />
          <AnimatePresence mode="wait" initial={true}>
            <Component {...pageProps} key={router.route} />
          </AnimatePresence>
        </SnowflakesProvider>
      </ApiapProvider>
    </QueryClientProvider>
  );
}
