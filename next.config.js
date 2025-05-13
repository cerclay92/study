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
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fntiuopyonutxkeeipsc.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGl1b3B5b251dHhrZWVpcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMTE1NTgsImV4cCI6MjA2MjU4NzU1OH0.J_gFu3MByiStp6IO7EmT4Lplp-_QYY0lLkX8h3L6S5o',
  },
  // 생성 최적화 설정
  poweredByHeader: false,
  // 빌드 오류 방지를 위한 추가 설정
  experimental: {
    // 중복 라우트 무시
    allowDynamicGlobImports: true,
    // API 라우트 처리 개선
    serverComponentsExternalPackages: ["@supabase/ssr"]
  }
};

module.exports = nextConfig; 