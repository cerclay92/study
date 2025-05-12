import React from "react";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import { CATEGORIES } from "@/constants/theme";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = params;
  
  // 상수에서 먼저 카테고리 확인
  const localCategory = CATEGORIES.find(cat => cat.slug === slug);
  if (localCategory) {
    return {
      title: `${localCategory.name} - 블로그`,
      description: `${localCategory.name} 카테고리의 글 목록입니다.`,
    };
  }
  
  // 상수에 없다면 DB에서 조회
  const supabase = createServerClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .single();
  
  if (!category) {
    return {
      title: "카테고리를 찾을 수 없음",
      description: "요청하신 카테고리를 찾을 수 없습니다.",
    };
  }
  
  return {
    title: `${category.name} - 블로그`,
    description: `${category.name} 카테고리의 글 목록입니다.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  
  try {
    const supabase = createServerClient();
    
    // 로컬 상수에서 카테고리 정보 확인
    const localCategory = CATEGORIES.find(cat => cat.slug === slug);
    let categoryId: number | null = null;
    let categoryName: string | null = null;
    
    if (localCategory) {
      categoryId = localCategory.id;
      categoryName = localCategory.name;
    } else {
      try {
        // 상수에 없다면 DB에서 조회
        const { data: categories, error: categoryError } = await supabase
          .from("categories")
          .select("*");
        
        if (categoryError) {
          console.error("카테고리 정보 조회 오류:", categoryError);
          console.error("오류 세부정보:", JSON.stringify(categoryError));
          notFound();
        }
        
        // 카테고리 목록에서 slug와 일치하는 항목 찾기
        const category = categories?.find(c => {
          // 카테고리 테이블에 slug 필드가 없을 수 있으므로 
          // 이름을 소문자로 변환하여 비교
          return c.name?.toLowerCase() === slug.toLowerCase();
        });
        
        if (!category) {
          console.error(`카테고리를 찾을 수 없음: ${slug}`);
          notFound();
        }
        
        categoryId = category.id;
        categoryName = category.name;
      } catch (error) {
        console.error("카테고리 정보 조회 중 예외 발생:", error);
        notFound();
      }
    }
    
    // 카테고리에 해당하는 게시글 가져오기
    let articles = [];
    try {
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("*")
        .eq("category_id", categoryId);
      
      if (articlesError) {
        console.error("게시글 목록 조회 오류:", articlesError);
        console.error("오류 세부정보:", JSON.stringify(articlesError));
      } else {
        articles = articlesData || [];
        console.log("가져온 카테고리 게시글:", articles);
      }
      
      // 디버깅용 로깅
      console.log(`카테고리 ID: ${categoryId}, 이름: ${categoryName}, 슬러그: ${slug}`);
      console.log("게시글 수:", articles?.length || 0);
    } catch (error) {
      console.error("게시글 목록 조회 중 예외 발생:", error);
      articles = [];
    }
    
    return (
      <PageLayout>
        <div className="container py-10">
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                모든 카테고리로 돌아가기
              </Link>
            </Button>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{categoryName}</h1>
            <p className="text-muted-foreground">
              {`${categoryName} 카테고리의 게시글 목록입니다.`}
            </p>
          </div>
          
          {!articles || articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">이 카테고리에 게시글이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden h-full flex flex-col border-none shadow-md hover:shadow-lg transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.featured_image || "https://picsum.photos/id/24/800/600"}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader className="flex-grow p-4 sm:p-5">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      <Link href={`/article/${article.slug}`}>{article.title}</Link>
                    </CardTitle>
                    <CardDescription className="flex items-center text-xs mt-2">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {new Date(article.published_at || article.created_at).toLocaleDateString('ko-KR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-5 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.excerpt || article.title}
                    </p>
                  </CardContent>
                  <CardFooter className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                    <Button asChild variant="link" size="sm" className="px-0 py-0 h-auto font-medium text-primary">
                      <Link href={`/article/${article.slug}`}>
                        더 읽기
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    );
  } catch (error) {
    console.error("카테고리 페이지 로딩 중 오류 발생:", error);
    notFound();
  }
} 