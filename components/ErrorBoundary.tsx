import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // If the error message is about a component unmounting, don't show an error UI
    if (error.message === 'Component unmounted' || 
        error.message.includes('unmounted') ||
        error.message.includes('Canceled')) {
      console.log('Suppressed error in ErrorBoundary:', error.message);
      return { hasError: false, error: null };
    }
    
    // For all other errors, update state to trigger error UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // If it's a Component unmounted error, just log it silently
    if (error.message === 'Component unmounted' || 
        error.message.includes('unmounted') ||
        error.message.includes('Canceled')) {
      console.log('Unmount-related error caught:', error.message);
      return;
    }
    
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="bg-surface p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-text-secondary mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 