/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: ["app-build-manifest.json"],
});

const { version } = require('./package.json');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let changelogEn = 'No changes to display.';
let changelogPl = 'Brak zmian do wyświetlenia.';

try {
  const enPath = path.join(__dirname, 'CHANGELOG_EN.md');
  const plPath = path.join(__dirname, 'CHANGELOG_PL.md');

  if (fs.existsSync(enPath)) {
    changelogEn = fs.readFileSync(enPath, 'utf8').trim();
  } else {
    changelogEn = execSync('git log -1 --pretty=%B').toString().trim();
  }

  if (fs.existsSync(plPath)) {
    changelogPl = fs.readFileSync(plPath, 'utf8').trim();
  } else {
    changelogPl = changelogEn; // Fallback to English if Polish is missing
  }
} catch (error) {
  console.error('Failed to get changelog:', error.message);
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  compiler: {
    styledComponents: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_CHANGELOG_EN: changelogEn,
    NEXT_PUBLIC_CHANGELOG_PL: changelogPl,
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