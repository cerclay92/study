"use client";

import { format } from "date-fns";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, Heart, Share2, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentSection } from "@/features/blog/components/CommentSection";

interface ArticleDetailProps {
  article: {
    id: number;
    title: string;
    content: string;
    excerpt?: string;
    category_id: number;
    categories?: {
      id: number;
      name: string;
    };
    featured_image?: string;
    slug: string;
    created_at: string;
    published_at?: string;
    author_name?: string;
    tags?: Array<{
      id: number;
      name: string;
    }>;
  };
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
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