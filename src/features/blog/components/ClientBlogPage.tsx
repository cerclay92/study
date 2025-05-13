"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from "@/components/PageLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { BlogArticleCard } from "@/components/BlogArticleCard";
import { CATEGORIES } from "@/constants/theme";

// 서버 액션 타입
type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
  created_at: string;
  category_id: number;
  published: boolean;
  views?: number;
  content: string;
  category: {
    id: string;
    name: string;
  };
  author: {
    name: string;
  };
};

// 데이터 패칭 함수
async function fetchData(categoryId?: string, search?: string) {
  try {
    const response = await fetch(`/api/blog/articles?${new URLSearchParams({
      ...(categoryId && categoryId !== "all" ? { category: categoryId } : {}),
      ...(search ? { search } : {})
    })}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("데이터 패칭 중 오류:", error);
    return [];
  }
}

// Suspense 내부에서 useSearchParams를 사용하는 컴포넌트
function BlogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const selectedCategory = CATEGORIES.find(cat => cat.slug === categorySlug);
        const categoryId = selectedCategory ? selectedCategory.id.toString() : undefined;
        const data = await fetchData(categoryId, searchQuery);
        setArticles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("데이터 로딩 중 오류:", error);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [categorySlug, searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    
    const url = new URL(window.location.href);
    if (search) {
      url.searchParams.set("search", search);
    } else {
      url.searchParams.delete("search");
    }
    router.push(url.toString());
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="w-full sm:w-48">
          <form>
            <Select
              name="category"
              value={categorySlug}
              onValueChange={(value) => {
                const url = new URL(window.location.href);
                if (value === "all") {
                  url.searchParams.delete("category");
                } else {
                  url.searchParams.set("category", value);
                }
                router.push(url.toString());
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </form>
        </div>
        
        <form className="flex gap-2" onSubmit={handleSearch}>
          <Input
            name="search"
            placeholder="검색어를 입력하세요"
            defaultValue={searchQuery}
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div>로딩 중...</div>
      ) : articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <BlogArticleCard
              key={article.id}
              article={{
                ...article,
                content: article.content || article.excerpt || "",
                category: {
                  id: article.category?.id || article.category_id.toString(),
                  name: article.category?.name || CATEGORIES.find(cat => cat.id === article.category_id)?.name || "기타"
                },
                author: article.author || {
                  name: "관리자"
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          게시글이 없습니다
        </div>
      )}
    </div>
  );
}

export default function ClientBlogPage() {
  return (
    <PageLayout>
      <div className="container py-8">
        <Suspense fallback={<div>로딩 중...</div>}>
          <BlogPageContent />
        </Suspense>
      </div>
    </PageLayout>
  );
} 