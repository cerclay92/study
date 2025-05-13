"use client";

import React, { ReactElement } from "react";
import Link from "next/link";
import { FileText, BookOpen, Palette, Lightbulb, Newspaper, Shapes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/constants/theme";
import ClientHome from "@/features/home/components/ClientHome";

// 카테고리별 아이콘 매핑
const categoryIcons: Record<string, ReactElement> = {
  "에세이": <FileText className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 에세이
  "인문학": <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 인문학
  "문화": <Palette className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 문화
  "과학": <Lightbulb className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 과학
  "시사": <Newspaper className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 시사
  "기타": <Shapes className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 기타
};

<<<<<<< HEAD
export default async function Home() {
  // Supabase 클라이언트 생성
  const supabase = createServerClient();
  
  // 데이터를 담을 변수 초기화
  let dbCategories = [];
  let featuredWithFallback = [];
  let recentPosts = [];
  
  try {
    // 인기 게시글 가져오기 (조회수 기준)
    try {
      const { data: featuredPosts, error: featuredError } = await supabase
        .from("articles")
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image,
          published_at,
          created_at,
          category_id,
          views,
          published
        `)
        .limit(3);
      
      if (featuredError) {
        console.error("인기 게시글 조회 오류:", featuredError);
        console.error("오류 세부정보:", JSON.stringify(featuredError));
      } else {
        featuredWithFallback = featuredPosts || [];
        console.log("가져온 인기 게시글:", featuredWithFallback);
      }
      
      // 인기 글이 없으면 최신 글 가져오기
      if (featuredWithFallback.length === 0) {
        try {
          const { data: fallbackPosts, error: fallbackError } = await supabase
            .from("articles")
            .select(`
              id,
              title, 
              slug,
              excerpt,
              featured_image,
              published_at,
              created_at,
              category_id,
              views,
              published
            `)
            .limit(3);
          
          if (fallbackError) {
            console.error("대체 게시글 조회 오류:", fallbackError);
            console.error("오류 세부정보:", JSON.stringify(fallbackError));
          } else {
            featuredWithFallback = fallbackPosts || [];
            console.log("가져온 대체 게시글:", featuredWithFallback);
          }
        } catch (err) {
          console.error("대체 게시글 조회 중 예외 발생:", err);
        }
      }
    } catch (err) {
      console.error("인기 게시글 조회 중 예외 발생:", err);
    }
    
    // 모든 게시글에 대한 카테고리 정보 로드
    let categoryData = {};
    try {
      const { data: allCategories, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name");
      
      if (categoriesError) {
        console.error("카테고리 정보 로드 오류:", categoriesError);
      } else if (allCategories) {
        // 카테고리 ID를 키로 하는 맵 생성
        allCategories.forEach(cat => {
          categoryData[cat.id] = cat;
        });
        console.log("카테고리 데이터 맵:", categoryData);
      }
    } catch (err) {
      console.error("카테고리 정보 로드 중 예외 발생:", err);
    }
    
    // 최신 게시글 가져오기
    try {
      const { data: recentPostsData, error: recentError } = await supabase
        .from("articles")
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image,
          published_at,
          created_at,
          category_id,
          published
        `)
        .limit(4);
      
      if (recentError) {
        console.error("최신 게시글 조회 오류:", recentError);
        console.error("오류 세부정보:", JSON.stringify(recentError));
      } else {
        recentPosts = recentPostsData || [];
        console.log("가져온 최신 게시글:", recentPosts);
      }
    } catch (err) {
      console.error("최신 게시글 조회 중 예외 발생:", err);
    }
    
    // 디버깅을 위해 콘솔에 데이터 출력
    console.log("Fetched featuredWithFallback:", featuredWithFallback);
    console.log("Fetched recentPosts:", recentPosts);
  
    // 렌더링 부분
    return (
      <PageLayout>
        {/* 히어로 섹션 */}
        <section className="relative py-16 sm:py-20 md:py-28 lg:py-32 overflow-hidden">
          {/* 배경 비디오 */}
          <VideoBackground 
            videoSrc="https://fntiuopyonutxkeeipsc.supabase.co/storage/v1/object/public/video//hero.mp4"
            fallbackImageSrc="https://picsum.photos/id/25/1920/1080"
          />
          
          {/* 장식 요소 */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 z-10">
            <div className="absolute top-10 left-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-primary/20 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 md:w-60 h-40 md:h-60 rounded-full bg-accent/10 blur-3xl"></div>
          </div>
          
          <div className="container relative z-20">
            <div className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 md:mb-8 tracking-tight animate-fade-up animate-once animate-duration-700 animate-delay-100">
                <span className="text-primary">{SERVICE_NAME}</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white drop-shadow-lg font-semibold mb-6 sm:mb-8 md:mb-10 leading-relaxed animate-fade-up animate-once animate-duration-700 animate-delay-200">
                깊이 있는 생각, 연결되는 사람들.<br />
                당신의 이야기가 시작되는 곳.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animate-once animate-duration-700 animate-delay-300">
                <Button asChild size="lg" className="rounded-sm bg-primary hover:bg-primary/90 px-6 sm:px-8 py-5 sm:py-6 text-base shadow-md font-medium">
                  <Link href="/subscribe">구독하기</Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="rounded-sm border-gray-300 text-gray-700 px-6 sm:px-8 py-5 sm:py-6 text-base transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary"
                >
                  <Link href="/about">서비스 소개</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 카테고리 소개 */}
        <section className="py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {CATEGORIES.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/blog/category/${category.slug}`}
                  className="group flex flex-col items-center justify-center bg-white dark:bg-secondary/20 rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-primary text-white flex items-center justify-center mb-2 sm:mb-3 md:mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                    {categoryIcons[category.name]}
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-foreground group-hover:text-primary transition-colors text-center">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 추천 게시글 */}
        <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-secondary/10">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-0">
                <span className="border-b-[3px] border-primary pb-1">인기 글</span>
              </h2>
              <Link 
                href="/blog" 
                className="text-primary flex items-center gap-1 sm:gap-2 font-medium hover:underline group text-sm sm:text-base"
              >
                전체보기 <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {featuredWithFallback?.map((post) => {
                let categoryName = "미분류";
                if (post.category_id && categoryData[post.category_id]) {
                  categoryName = categoryData[post.category_id].name;
                } else {
                  const constCategory = CATEGORIES.find(c => c.id === post.category_id);
                  if (constCategory) {
                    categoryName = constCategory.name;
                  }
                }
                
                return (
                  <Card key={post.id} className="overflow-hidden h-full flex flex-col border-none shadow-md hover:shadow-lg transition-all duration-300 group">
                    <div className="relative h-40 sm:h-44 md:h-48 lg:h-52 overflow-hidden">
                      <Image
                        src={post.featured_image || "https://picsum.photos/id/24/800/600"}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-primary text-white py-1 px-2 text-xs sm:text-sm rounded-sm font-medium shadow-sm">
                        {categoryName}
                      </div>
                    </div>
                    <CardHeader className="flex-grow p-3 sm:p-4 md:p-5 lg:p-6">
                      <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/article/${post.slug}`}>{post.title}</Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-3 mt-2 sm:mt-3 text-xs sm:text-sm md:text-base">
                        {post.excerpt || post.title}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0 px-3 sm:px-4 md:px-5 lg:px-6 pb-3 sm:pb-4 md:pb-5 lg:pb-6">
                      <Button asChild variant="link" className="p-0 font-medium text-primary">
                        <Link href={`/article/${post.slug}`} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base group-hover:underline">
                          더 읽기 <ArrowRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* 최신 게시글 */}
        <section className="py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-0">
                <span className="border-b-[3px] border-primary pb-1">최신 글</span>
              </h2>
              <Link 
                href="/blog" 
                className="text-primary flex items-center gap-1 sm:gap-2 font-medium hover:underline group text-xs sm:text-sm md:text-base"
              >
                전체보기 <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {recentPosts?.map((post) => {
                let categoryName = "미분류";
                if (post.category_id && categoryData[post.category_id]) {
                  categoryName = categoryData[post.category_id].name;
                } else {
                  const constCategory = CATEGORIES.find(c => c.id === post.category_id);
                  if (constCategory) {
                    categoryName = constCategory.name;
                  }
                }
                
                return (
                  <Card key={post.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="relative h-32 sm:h-36 md:h-38 lg:h-40 overflow-hidden">
                      <Image
                        src={post.featured_image || "https://picsum.photos/id/24/400/300"}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 bg-primary text-white py-1 px-2 text-xs rounded-sm font-medium shadow-sm">
                        {categoryName}
                      </div>
                    </div>
                    <CardHeader className="p-2 sm:p-3 md:p-4">
                      <CardTitle className="text-xs sm:text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/article/${post.slug}`}>{post.title}</Link>
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
                        {formatDate(new Date(post.published_at || post.created_at))}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* 클라이언트 컴포넌트로 분리한 부분 */}
        <ClientHome />
      </PageLayout>
    );
  } catch (error) {
    console.error("홈페이지 로딩 중 오류 발생:", error);
    
    // 오류가 발생해도 최소한의 UI는 표시
    return (
      <PageLayout>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-6">{SERVICE_NAME}</h1>
          <p className="text-muted-foreground mb-8">
            데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          <Button asChild className="mx-auto">
            <Link href="/blog">블로그 둘러보기</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }
=======
export default function HomePage() {
  return <ClientHome categoryIcons={categoryIcons} />;
>>>>>>> e93acc1ca4550f1cf3f40f87f92b385f82480fc0
}
