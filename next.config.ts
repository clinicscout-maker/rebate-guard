const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Config options
  turbopack: {} // Silence Turbopack warning when using webpack plugins like next-pwa
};


module.exports = withPWA(nextConfig);
