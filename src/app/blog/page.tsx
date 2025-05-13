import { Metadata } from "next";
import { Suspense } from "react";
import ClientBlogPage from "@/features/blog/components/ClientBlogPage";

export const metadata: Metadata = {
  title: "블로그 - 서재, 사람을 잇다",
  description: "서재, 사람을 잇다의 블로그 페이지입니다.",
};

export default function BlogPage() {
  return (
    <Suspense fallback={<div>페이지 로딩 중...</div>}>
      <ClientBlogPage />
    </Suspense>
  );
} 