import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import AuthModal from '@/components/ui/AuthModal';
import { isAuthenticated, saveUserData } from '@/lib/utils/auth-utils';
import { useApiap } from '@/context/ApiapContext';

export default function Home() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setApiap } = useApiap();

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      // If authenticated, redirect to dashboard
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
      return () => clearTimeout(redirectTimer);
    } else {
      // If not authenticated, show auth modal after brief delay
      const modalTimer = setTimeout(() => {
        setShowAuthModal(true);
      }, 1000);
      
      return () => clearTimeout(modalTimer);
    }
  }, [router]);

  // Handle API key validation
  const handleAuthSubmit = async (apiap: string, name: string, email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Authenticating with API key...');
      
      // Send API key to server for validation
      const response = await fetch('/api/validate-apiap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiap })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Authentication successful, saving user data...');
        
        // Save valid credentials to localStorage
        saveUserData(apiap, name, email);
        
        // Update ApiapContext with new APIAP
        setApiap(apiap);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        console.error('Authentication failed:', data.error);
        setError(data.error || 'Invalid API key. Please check and try again.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      
      // Provide more detailed error message if available
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to validate API key. Please try again.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-5xl font-mono font-bold text-primary mb-2">
          Dark Tide
        </h1>
        <p className="text-text-secondary mb-6">Electronic Diary</p>
        
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
      </motion.div>
      
      {showAuthModal && (
        <AuthModal 
          onSubmit={handleAuthSubmit}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
} 