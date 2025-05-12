import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { SERVICE_NAME } from '@/constants/theme';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/components/auth/auth-provider';

export const metadata: Metadata = {
  title: SERVICE_NAME,
  description: '사람과 사람을 잇는 온라인 매거진 서비스',
  keywords: ['매거진', '에세이', '인문학', '문화', '상담', '인터뷰', '구독'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="https://fntiuopyonutxkeeipsc.supabase.co/storage/v1/object/public/video//favicon.ico" />
      </head>
      <body
        className={cn(
          'antialiased font-paperlogy min-h-screen bg-background'
        )}
      >
        <Providers><AuthProvider>{children}</AuthProvider></Providers>
        <Toaster />
      </body>
    </html>
  );
}
