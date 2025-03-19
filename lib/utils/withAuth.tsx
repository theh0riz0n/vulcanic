import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { hasRequiredAuthData } from './auth-utils';

// Higher-order component to protect routes that require authentication
export default function withAuth(WrappedComponent: React.ComponentType<any>) {
  // Return a new component
  const WithAuth = (props: any) => {
    const router = useRouter();

    useEffect(() => {
      // Check if all required auth data is present
      if (!hasRequiredAuthData()) {
        // Redirect to home page if any required auth data is missing
        router.push('/').then(() => {
          // Reload the page after redirect completes
          window.location.reload();
        });
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  // Set a display name for the HOC
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAuth.displayName = `WithAuth(${displayName})`;

  return WithAuth;
} 