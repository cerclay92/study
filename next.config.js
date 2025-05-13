/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TS 오류가 있어도 빌드 진행
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
  // Vercel 배포 안정성을 위한 추가 설정
  swcMinify: true,
  reactStrictMode: true,
  // 환경 변수 설정
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // 생성 최적화 설정
  poweredByHeader: false
};

module.exports = nextConfig; 