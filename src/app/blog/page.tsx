<<<<<<< HEAD
import { Metadata } from "next";
import ClientBlogPage from "@/features/blog/components/ClientBlogPage";

export const metadata: Metadata = {
  title: "블로그 - 서재, 사람을 잇다",
  description: "서재, 사람을 잇다의 블로그 페이지입니다.",
};

=======
"use client";

import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/constants/theme";

// 서버 액션 타입
type Category = {
  id: string;
  name: string;
};

type Article = {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  created_at: string;
  category: Category;
  author: {
    name: string;
  };
};

// 데이터 패칭 함수
async function fetchData(categoryId?: string, search?: string) {
  const response = await fetch(`/api/blog/articles?${new URLSearchParams({
    ...(categoryId && categoryId !== "all" ? { category: categoryId } : {}),
    ...(search ? { search } : {})
  })}`);
  const data = await response.json();
  return data;
}

>>>>>>> e93acc1ca4550f1cf3f40f87f92b385f82480fc0
export default function BlogPage() {
  return <ClientBlogPage />;
} 