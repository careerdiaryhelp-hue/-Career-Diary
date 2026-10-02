import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      { source: '/terms-conditions', destination: '/terms' },
      { source: '/last-date-jobs', destination: '/last-date' },
      { source: '/last-date-reminder', destination: '/last-date' },
      { source: '/top-online-form-list', destination: '/top-online-forms' },
      { source: '/ssc', destination: '/?q=SSC' },
      { source: '/rrb', destination: '/?q=RRB' },
      { source: '/bpsc', destination: '/?q=BPSC' },
      { source: '/bihar-police', destination: '/?q=Bihar+Police' },
      { source: '/bank', destination: '/?q=Bank' },
      { source: '/upsc', destination: '/?q=UPSC' },
    ];
  },
  async headers() {
    return [];
  },
};

export default nextConfig;

