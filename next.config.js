/** @type {import('next').NextConfig} */
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
    // If we are on the client (not server), replace fs and other node modules with empty stubs
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        child_process: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig; 