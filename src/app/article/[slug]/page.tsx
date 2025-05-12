import { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, Heart, Share2, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getArticleBySlug } from "@/features/blog/api";
import { CommentSection } from "@/features/blog/components/CommentSection";
import { createServerClient } from "@/lib/supabase/server";

const ARTICLE = {
  id: 1,
  title: "책을 통해 만나는 나와 세상의 연결",
  content: `
    <p>책은 단순한 종이 뭉치가 아닌, 저자의 삶과 생각의 연결 고리입니다. 책을 읽는 행위는 나와 세상을 이어주는 방법 중 하나입니다.</p>
    
    <p>독서는 단순히 지식을 얻는 행위를 넘어서 타인의 경험과 사고방식을 간접적으로 체험하는 과정입니다. 한 권의 책 속에는 수많은 인생과 이야기가 담겨 있으며, 우리는 그것을 통해 시공간을 초월한 대화를 나눌 수 있습니다.</p>
    
    <h2>연결의 시작, 책장을 넘기는 순간</h2>
    
    <p>첫 페이지를 넘기는 순간, 우리는 저자가 만들어낸 세계로 발을 들이게 됩니다. 그 세계는 완전히 허구적일 수도 있고, 현실을 반영한 것일 수도 있습니다. 중요한 것은 그 과정에서 우리가 타인의 시선으로 세상을 바라볼 수 있게 된다는 점입니다.</p>
    
    <p>소설을 통해 우리는 다양한 인물들의 삶을 경험하고, 그들의 감정과 생각을 이해할 수 있습니다. 에세이를 읽으면서는 저자의 개인적인 경험과 철학을 공유받습니다. 이런 경험들은 우리의 시야를 넓혀주고, 세상을 더 다채롭게 볼 수 있도록 도와줍니다.</p>
    
    <h2>책과 나의 대화</h2>
    
    <p>책을 읽는 것은 일방적인 커뮤니케이션이 아닙니다. 우리는 텍스트를 해석하고, 그것에 대한 자신만의 의미를 부여합니다. 같은 책을 읽어도 각자 다른 해석과 감상을 갖게 되는 이유입니다.</p>
    
    <p>이렇게 책과 나누는 내적 대화는 자기 이해와 성찰의 기회를 제공합니다. 텍스트와의 상호작용 속에서 우리는 자신의 가치관이나 신념을 재확인하거나 때로는 의문을 제기하게 됩니다.</p>
    
    <h2>세상과의 연결고리</h2>
    
    <p>책은 또한 우리와 거시적인 세계를 연결해주는 고리 역할을 합니다. 역사서를 통해 과거와 소통하고, 과학서적을 통해 자연의 법칙을 이해하며, 사회과학 서적을 통해 인간관계와 사회 구조를 탐구합니다.</p>
    
    <p>이런 지식과 통찰은 우리가 세상을 더 깊이 이해하고, 그 안에서 자신의 위치를 파악하는 데 도움을 줍니다. 책을 통한 간접 경험은 우리의 실제 경험을 보다 풍부하게 만들어주며, 삶의 다양한 측면을 탐색할 수 있는 기회를 제공합니다.</p>
    
    <h2>연결의 확장, 독서 커뮤니티</h2>
    
    <p>책을 통한 연결은 개인적인 차원을 넘어 사회적 차원으로 확장될 수 있습니다. 독서 모임이나 온라인 서평, 도서 관련 토론회 등을 통해 우리는 다른 독자들과 생각을 나누고 소통할 수 있습니다.</p>
    
    <p>이런 공유의 과정은 책의 의미를 더욱 풍부하게 만들어줍니다. 다양한 시각과 해석을 접하면서 우리는 자신이 미처 발견하지 못했던 책의 측면을 발견하고, 더 깊은 이해에 도달할 수 있습니다.</p>
    
    <h2>결론: 책, 연결의 매개체</h2>
    
    <p>책은 종이와 잉크로 이루어진 물리적 대상 이상의 의미를 갖습니다. 그것은 우리와 저자, 우리와 세상, 그리고 우리와 우리 자신을 연결해주는 매개체입니다.</p>
    
    <p>독서를 통해 우리는 시공간의 제약을 넘어 다양한 사람들과 소통하고, 무한한 세계를 경험할 수 있습니다. 그리고 그 과정에서 우리는 더 넓은 시야와 깊은 통찰을 얻을 수 있습니다.</p>
    
    <p>책을 읽는 것은 단순한 지식 습득이 아닌, 연결의 경험입니다. 그것은 우리가 혼자가 아니라 무수한 생각과 이야기로 이루어진 거대한 네트워크의 일부임을 일깨워줍니다.</p>
  `,
  excerpt: "책은 단순한 종이 뭉치가 아닌, 저자의 삶과 생각의 연결 고리입니다. 책을 읽는 행위는 나와 세상을 이어주는 방법 중 하나입니다.",
  category: "에세이",
  category_slug: "essay",
  image: "https://picsum.photos/id/24/1200/600",
  slug: "book-connecting-me-and-world",
  created_at: new Date(2023, 4, 15).toISOString(),
  author: {
    name: "김민수",
    bio: "문학평론가, 에세이스트",
    avatar: "https://i.pravatar.cc/150?u=test",
  },
  likes: 42,
  related_posts: [
    {
      id: 2,
      title: "현대인의 정신건강과 문학적 치유",
      category: "인문학",
      slug: "modern-mental-health-literature",
      image: "https://picsum.photos/id/342/400/300",
    },
    {
      id: 6,
      title: "언어의 경계를 넘어서는 번역의 예술",
      category: "에세이",
      slug: "art-of-translation",
      image: "https://picsum.photos/id/30/400/300",
    },
  ]
};

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

// 메타데이터 생성
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = params;
  
  try {
    // API 라우트를 통해 서버에서 직접 데이터 가져오기
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        categories:category_id(*)
      `)
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return {
        title: "게시글을 찾을 수 없음",
        description: "요청하신 게시글을 찾을 수 없습니다.",
      };
    }
    
    return {
      title: data.title,
      description: data.excerpt || data.content.slice(0, 160).replace(/<[^>]*>/g, ''),
      openGraph: data.featured_image ? {
        images: [data.featured_image],
      } : undefined,
    };
  } catch (error) {
    console.error("메타데이터 생성 오류:", error);
    return {
      title: "블로그 게시글",
      description: "서재, 사람을 잇다 블로그",
    };
  }
}

// 게시글 페이지 컴포넌트
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;
  
  // API 라우트를 통해 서버에서 직접 데이터 가져오기
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      categories:category_id(*)
    `)
    .eq("slug", slug)
    .single();
  
  if (error || !data || !data.published) {
    notFound();
  }
  
  // 태그 정보 가져오기
  const { data: tagsData } = await supabase
    .from("article_tags")
    .select("tags(*)")
    .eq("article_id", data.id);
  
  const tags = tagsData?.map(item => item.tags) || [];
  
  const article = {
    ...data,
    author_name: "관리자", // 간단한 임시 값
    tags
  };

  // 조회수 기록
  const pagePath = `/article/${slug}`;
  await supabase.rpc('increment_page_view', {
    article_id_param: article.id,
    page_path_param: pagePath
  });
  
  const categoryName = article.categories?.name || "미분류";
  const authorName = article.author_name || "관리자";
  const publishedDate = article.published_at || article.created_at;
  const formattedDate = format(new Date(publishedDate), "yyyy년 MM월 dd일");

  return (
    <PageLayout>
      <article className="container py-10 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              블로그로 돌아가기
            </Link>
          </Button>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link 
                href={`/blog/category/${article.category_id}`}
                className="bg-primary/10 text-primary hover:bg-primary/20 rounded-md px-2 py-1 transition-colors"
              >
                {categoryName}
              </Link>
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center">
                <Calendar className="mr-1 h-3.5 w-3.5" />
                {formattedDate}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{article.title}</h1>
            
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{authorName.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{authorName}</span>
            </div>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                {article.tags.map((tag) => (
                  <Link 
                    key={tag.id} 
                    href={`/blog/tag/${tag.id}`}
                    className="text-sm bg-muted hover:bg-muted/80 rounded-md px-2 py-1 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {article.featured_image && (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
            <img 
              src={article.featured_image} 
              alt={article.title} 
              className="object-cover w-full h-full" 
            />
          </div>
        )}
        
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* 댓글 섹션 - 클라이언트 컴포넌트 */}
        <CommentSection articleId={article.id} />
      </article>
    </PageLayout>
  );
} 