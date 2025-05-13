"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BlogArticleCard } from "@/components/BlogArticleCard";

function BlogParamsWrapper() {
  const searchParams = useSearchParams();
  // searchParams 사용하는 로직이 있을 경우 여기서 처리
  return null;
}

export default function ClientBlogPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <BlogParamsWrapper />
    </Suspense>
  );
} 