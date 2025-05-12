import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ArticleDetail from "@/features/blog/components/ArticleDetail";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const supabase = await createServerClient();
    
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
    console.error("Error fetching article metadata:", error);
    return {
      title: "오류 발생",
      description: "게시글 정보를 가져오는 중 오류가 발생했습니다.",
    };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        categories:category_id(*)
      `)
      .eq("slug", slug)
      .single();

    if (error || !data) {
      notFound();
    }

    return <ArticleDetail article={data} />;
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
} 