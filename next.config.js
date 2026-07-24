/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // Keep migration stable while legacy APIs return mixed image hosts.
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
};

module.exports = nextConfig;
