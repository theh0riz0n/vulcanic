import React from 'react';
import { Warning } from '@phosphor-icons/react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface/50 rounded-xl">
      <Warning size={48} weight="duotone" className="text-red-500 mb-3" />
      <h3 className="text-xl font-mono font-bold text-text-primary mb-2">Error</h3>
      <p className="text-text-secondary text-center mb-4">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay; 