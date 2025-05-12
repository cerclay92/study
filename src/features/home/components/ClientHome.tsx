'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const PACKAGE_NAME = '@easynext/cli';
const CURRENT_VERSION = 'v0.1.35';

function latestVersion(packageName: string) {
  return axios
    .get('https://registry.npmjs.org/' + packageName + '/latest')
    .then((res) => res.data.version);
}

export default function ClientHome() {
  const { toast } = useToast();
  const [latest, setLatest] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const version = await latestVersion(PACKAGE_NAME);
        setLatest(`v${version}`);
      } catch (error) {
        console.error('Failed to fetch version info:', error);
      }
    };
    fetchLatestVersion();
  }, []);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(`npm install -g ${PACKAGE_NAME}@latest`);
    toast({
      description: 'Update command copied to clipboard',
    });
  };

  const needsUpdate = latest && latest !== CURRENT_VERSION;

  return (
    <>
      {/* 구독 홍보 섹션 */}
      <section className="py-12 sm:py-14 md:py-16 bg-primary/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <div className="container px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground">매월 특별한 콘텐츠를 받아보세요</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 md:mb-10">
              월 1,000원으로 모든 콘텐츠를 제한 없이 이용하고
              <br className="hidden sm:block" />
              독점 뉴스레터를 매월 받아보세요.
            </p>
            <Button asChild size="lg" className="rounded-sm bg-primary hover:bg-primary/90 px-6 sm:px-8 md:px-10 py-5 sm:py-6 text-base shadow-md font-medium">
              <Link href="/subscribe">지금 구독하기</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Section() {
  const items = [
    { href: 'https://nextjs.org/', label: 'Next.js' },
    { href: 'https://ui.shadcn.com/', label: 'shadcn/ui' },
    { href: 'https://tailwindcss.com/', label: 'Tailwind CSS' },
    { href: 'https://www.framer.com/motion/', label: 'framer-motion' },
    { href: 'https://zod.dev/', label: 'zod' },
    { href: 'https://date-fns.org/', label: 'date-fns' },
    { href: 'https://ts-pattern.dev/', label: 'ts-pattern' },
    { href: 'https://es-toolkit.dev/', label: 'es-toolkit' },
    { href: 'https://zustand.docs.pmnd.rs/', label: 'zustand' },
    { href: 'https://supabase.com/', label: 'supabase' },
    { href: 'https://react-hook-form.com/', label: 'react-hook-form' },
  ];

  return (
    <div className="flex flex-col py-5 md:py-8 space-y-2 opacity-75">
      <p className="font-semibold">What&apos;s Included</p>

      <div className="flex flex-col space-y-1 text-muted-foreground">
        {items.map((item) => (
          <SectionItem key={item.href} href={item.href}>
            {item.label}
          </SectionItem>
        ))}
      </div>
    </div>
  );
}

function SectionItem({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 underline"
      target="_blank"
    >
      <CheckCircle className="w-4 h-4" />
      <p>{children}</p>
    </a>
  );
} 