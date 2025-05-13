"use client";

import { useEffect, useState, Suspense } from "react";
import PageLayout from "@/components/PageLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { BlogArticleCard } from "@/components/BlogArticleCard";
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

// 클라이언트 검색, 필터링 컴포넌트 - Suspense 내부에서 useSearchParams 사용
function ClientBlogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchData(categoryId, searchQuery);
        setArticles(data.articles);
        setCategories(data.categories);
      } catch (error) {
        console.error("데이터 로딩 중 오류:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [categoryId, searchQuery]);

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
              value={categoryId}
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
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
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
              article={article}
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

export default function BlogPage() {
  return (
    <PageLayout>
      <div className="container py-8">
        <Suspense fallback={<div>페이지 로딩 중...</div>}>
          <ClientBlogFilters />
        </Suspense>
      </div>
    </PageLayout>
  );
} 