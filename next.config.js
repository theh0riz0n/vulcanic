/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  compiler: {
    styledComponents: true,
  },
  
  // Add configuration to resolve issues with fs and other Node.js modules
  webpack: (config, { isServer }) => {
    // Fixing node: scheme imports
    if (!isServer) {
      // Don't attempt to import node modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http: false,
        https: false,
        crypto: false,
        stream: false,
        buffer: false,
        zlib: false,
        path: false,
        os: false,
        util: false,
      };
      
      // Replace hebece with an empty module on the client side
      config.resolve.alias = {
        ...config.resolve.alias,
        hebece: false,
      };
    }
    
    // Ensure server-only code doesn't leak into client bundles
    if (!isServer) {
      // Mark certain files as external to prevent bundling them in the client
      config.externals = [
        ...config.externals || [],
        'hebece',
        'node-fetch'
      ];
    }
    
    return config;
  },
};

module.exports = withPWA(nextConfig); 
