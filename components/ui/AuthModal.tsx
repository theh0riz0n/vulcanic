import { useState } from 'react';
import { motion } from 'framer-motion';

interface AuthModalProps {
  onSubmit: (apiap: string, name: string, email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function AuthModal({ onSubmit, isLoading, error }: AuthModalProps) {
  const [apiap, setApiap] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showApiap, setShowApiap] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(apiap, name, email);
  };

  // Function to show an example APIAP format
  const showExample = () => {
    setApiap('<html><head></head><body><input id="ap" type="hidden" value="{&quot;Tokens&quot;:[...],&quot;Alias&quot;:&quot;email@example.com&quot;,...}"></body></html>');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-background rounded-lg shadow-xl p-6 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-primary mb-2">Welcome to Dark Tide</h2>
        <p className="text-text-secondary mb-6">Please follow the steps below to connect your EduVulcan account</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded p-3 mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="apiap" className="block text-sm font-medium text-text-primary">
                EduVulcan API Key
              </label>
              <div className="flex space-x-2">
                <button 
                  type="button"
                  onClick={showExample}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Show Example
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowApiap(!showApiap)}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  {showApiap ? 'Hide' : 'Show'} Key
                </button>
              </div>
            </div>
            <textarea
              id="apiap"
              rows={5}
              value={apiap}
              onChange={(e) => setApiap(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Paste the entire content from Step 2 here"
              style={{ 
                filter: showApiap ? 'none' : 'blur(4px)',
                transition: 'filter 0.2s ease'
              }}
              required
            />
            <div className="mt-2 space-y-2 text-xs text-text-secondary">
              <h3 className="font-bold text-sm text-primary mb-1">How to get your API key:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Step 1:</strong> Log into your account at{" "}
                  <a 
                    href="https://eduvulcan.pl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    EduVulcan portal
                  </a>
                </li>
                <li>
                  <strong>Step 2:</strong> Open this URL:{" "}
                  <a 
                    href="view-source:https://eduvulcan.pl/api/ap/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-words"
                  >
                    view-source:https://eduvulcan.pl/api/ap/
                  </a>
                </li>
                <li>
                  <strong>Step 3:</strong> Copy the <strong>entire</strong> content of the page and paste it into the field above
                </li>
              </ol>
              <p className="mt-3">
                The correct API key format looks like:
              </p>
              <p className="bg-gray-800 p-2 rounded overflow-hidden text-xs" style={{ wordBreak: 'break-all' }}>
                <code>&lt;html&gt;&lt;head&gt;&lt;/head&gt;&lt;body&gt;&lt;input id="ap" type="hidden" value="&#123;&quot;Tokens&quot;: [...] ..."&gt;&lt;/body&gt;&lt;/html&gt;</code>
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
              Your Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              'Connect to EduVulcan'
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
} 