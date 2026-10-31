import { ADMIN_PATH } from './lib/adminPath.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false, // ไม่ปล่อย source map ให้คนดูโค้ดต้นฉบับ
  images: { unoptimized: true },
  // หลังบ้านเข้าทาง /<ADMIN_PATH> (ไม่ใช้ middleware แล้ว) ส่วนคนที่ไม่ใช่แอดมินจะเห็น 404 จากตัวหน้า
  async rewrites() {
    return [{ source: `/${ADMIN_PATH}`, destination: '/admin' }];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      { source: '/uploads/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
};
export default nextConfig;
