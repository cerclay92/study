"use client";

import PageLayout from "@/components/PageLayout";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/constants/theme";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Grid, LayoutList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 임시 게시글 데이터 (나중에 Supabase로 대체)
const CATEGORY_POSTS = {
  essay: [
    {
      id: 1,
      title: "책을 통해 만나는 나와 세상의 연결",
      excerpt: "책은 단순한 종이 뭉치가 아닌, 저자의 삶과 생각의 연결 고리입니다. 책을 읽는 행위는 나와 세상을 이어주는 방법 중 하나입니다.",
      image: "https://picsum.photos/id/24/800/600",
      slug: "book-connecting-me-and-world",
      createdAt: new Date(2023, 4, 15).toISOString(),
    },
    {
      id: 6,
      title: "언어의 경계를 넘어서는 번역의 예술",
      excerpt: "번역은 단순히 언어 간 전환이 아닌, 문화와 정서를 전달하는 예술입니다. 번역가의 세심한 선택이 독자의 경험을 완전히 바꿀 수 있습니다.",
      image: "https://picsum.photos/id/30/800/600",
      slug: "art-of-translation",
      createdAt: new Date(2023, 9, 22).toISOString(),
    },
    {
      id: 9,
      title: "독서의 계절, 가을에 읽기 좋은 책들",
      excerpt: "선선한 바람이 불어오는 가을은 독서하기에 가장 좋은 계절입니다. 이번 가을에 읽으면 좋을 다양한 장르의 책을 소개합니다.",
      image: "https://picsum.photos/id/89/800/600",
      slug: "autumn-reading-list",
      createdAt: new Date(2023, 8, 30).toISOString(),
    },
  ],
  humanities: [
    {
      id: 2,
      title: "현대인의 정신건강과 문학적 치유",
      excerpt: "바쁜 현대 사회에서 정신적 균형을 찾기란 쉽지 않습니다. 문학이 우리에게 제공하는 안식과 치유의 공간에 대한 고찰입니다.",
      image: "https://picsum.photos/id/342/800/600",
      slug: "modern-mental-health-literature",
      createdAt: new Date(2023, 5, 22).toISOString(),
    },
    {
      id: 7,
      title: "철학적 사고를 통한 일상의 변화",
      excerpt: "철학은 단순히 이론에 그치지 않고 우리의 일상과 사고방식에 변화를 가져올 수 있습니다. 다양한 철학적 개념을 일상에 적용하는 방법을 탐구합니다.",
      image: "https://picsum.photos/id/43/800/600",
      slug: "philosophical-thinking-daily-life",
      createdAt: new Date(2023, 10, 14).toISOString(),
    },
  ],
  culture: [
    {
      id: 3,
      title: "디지털 시대의 독서문화 변화",
      excerpt: "디지털 기술의 발전은 우리가 책을 읽는 방식부터 출판 산업까지 모든 것을 변화시켰습니다. 이러한 변화 속에서 독서의 의미를 재고찰합니다.",
      image: "https://picsum.photos/id/365/800/600",
      slug: "digital-age-reading-culture",
      createdAt: new Date(2023, 6, 10).toISOString(),
    },
  ],
  counseling: [
    {
      id: 4,
      title: "자기 성찰을 돕는 심리학 서적 5선",
      excerpt: "자기 이해와 성찰에 도움이 되는 심리학 서적들을 소개합니다. 이 책들은 우리 자신과 타인을 더 잘 이해하는 데 큰 도움이 될 것입니다.",
      image: "https://picsum.photos/id/25/800/600",
      slug: "self-reflection-psychology-books",
      createdAt: new Date(2023, 7, 5).toISOString(),
    },
  ],
  interview: [
    {
      id: 5,
      title: "베스트셀러 작가와의 대화",
      excerpt: "최근 화제가 된 베스트셀러 작가와의 독점 인터뷰입니다. 작가의 창작 과정과 영감의 원천에 대한 진솔한 이야기를 들어봅니다.",
      image: "https://picsum.photos/id/28/800/600",
      slug: "bestseller-author-interview",
      createdAt: new Date(2023, 8, 18).toISOString(),
    },
  ],
};

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: PageProps) {
  // Next.js 14.0.3 버전에서는 params가 Promise가 아니므로 use() 함수로 unwrap할 필요가 없습니다.
  const { slug } = params;
  
  // 카테고리 정보 찾기
  const category = CATEGORIES.find((cat) => cat.slug === slug);
  
  if (!category) {
    notFound();
  }
  
  // 해당 카테고리의 게시글 가져오기
  const posts = CATEGORY_POSTS[slug as keyof typeof CATEGORY_POSTS] || [];
  
  return (
    <PageLayout>
      <div className="container py-12">
        <header className="relative mb-12 pb-6 border-b">
          <div className="absolute top-0 right-0 -mt-8 opacity-10">
            <div className="w-40 h-40 rounded-full bg-primary blur-3xl"></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{category.name}</h1>
          <p className="text-muted-foreground text-lg">
            <span className="text-primary font-medium">'{category.name}'</span> 카테고리의 게시글 목록입니다. 총 {posts.length}개의 글이 있습니다.
          </p>
        </header>

        <Tabs defaultValue="grid" className="mb-10">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-8">
            <TabsList className="p-1 bg-secondary/40">
              <TabsTrigger value="grid" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-secondary">
                <Grid size={16} />
                <span>그리드 보기</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-secondary">
                <LayoutList size={16} />
                <span>리스트 보기</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-muted-foreground bg-secondary/20 px-4 py-2 rounded-full">
              최신순으로 정렬됨
            </div>
          </div>
          
          {/* 그리드 보기 */}
          <TabsContent value="grid" className="mt-0">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden h-full flex flex-col border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardHeader className="flex-grow">
                      <div className="text-sm text-primary font-medium mb-2">
                        {formatDate(post.createdAt)}
                      </div>
                      <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/article/${post.slug}`}>{post.title}</Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-3 mt-3 text-base">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <Button asChild variant="link" className="p-0 font-medium">
                        <Link href={`/article/${post.slug}`} className="flex items-center gap-2 group-hover:text-primary transition-colors">
                          더 읽기 <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-secondary/10 rounded-lg">
                <p className="text-muted-foreground text-lg">
                  아직 게시글이 없습니다.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* 리스트 보기 */}
          <TabsContent value="list" className="mt-0">
            {posts.length > 0 ? (
              <div className="space-y-8">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-secondary/5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-1/3 aspect-[4/3] md:aspect-auto">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <div className="text-sm text-primary font-medium mb-2">
                            {formatDate(post.createdAt)}
                          </div>
                          <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                            <Link href={`/article/${post.slug}`}>{post.title}</Link>
                          </h2>
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>
                        <Button asChild variant="link" className="p-0 font-medium self-start">
                          <Link href={`/article/${post.slug}`} className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            더 읽기 <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-secondary/10 rounded-lg">
                <p className="text-muted-foreground text-lg">
                  아직 게시글이 없습니다.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* 구독 홍보 */}
        <div className="mt-16 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">더 많은 콘텐츠를 원하시나요?</h3>
            <p className="mb-6 text-lg max-w-2xl mx-auto">월 1,000원으로 모든 프리미엄 콘텐츠를 즐기실 수 있습니다.</p>
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all">
              <Link href="/subscribe">지금 구독하기</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 