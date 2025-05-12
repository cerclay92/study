import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ApiResponse, handleApiError } from "@/lib/types/error";

interface Article {
  id: number;
  title: string;
  content: string;
  published: boolean;
  published_at: string | null;
  category_id: number;
  categories: {
    id: number;
    name: string;
  };
  tags?: Array<{
    id: number;
    name: string;
  }>;
  author_name: string;
}

// GET 요청 처리: 게시글 목록 가져오기
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const categoryId = searchParams.get("categoryId") ? parseInt(searchParams.get("categoryId")!) : undefined;
    const tagId = searchParams.get("tagId") ? parseInt(searchParams.get("tagId")!) : undefined;
    const searchQuery = searchParams.get("searchQuery") || undefined;
    
    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    // 기본 쿼리 설정
    let query = supabase
      .from("articles")
      .select(`
        *,
        categories:category_id(*)
      `)
      .eq("published", true)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 카테고리 필터링
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    // 검색어 필터링
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    const { data: articlesData, error } = await query;

    if (error) {
      const apiError = handleApiError(error);
      return NextResponse.json<ApiResponse>({ error: apiError }, { status: 500 });
    }

    // 태그 필터링 및 정보 가져오기
    let filteredArticles = articlesData;
    
    if (tagId) {
      const { data: taggedArticles, error: tagError } = await supabase
        .from("article_tags")
        .select("article_id")
        .eq("tag_id", tagId);

      if (tagError) {
        const apiError = handleApiError(tagError);
        return NextResponse.json<ApiResponse>({ error: apiError }, { status: 500 });
      }

      if (taggedArticles) {
        const articleIds = taggedArticles.map(item => item.article_id);
        filteredArticles = articlesData.filter(article => 
          articleIds.includes(article.id)
        );
      }
    }

    // 각 게시글의 태그 정보 가져오기
    const articles = await Promise.all(
      filteredArticles.map(async article => {
        const { data: tagsData, error: tagError } = await supabase
          .from("article_tags")
          .select("tags(*)")
          .eq("article_id", article.id);

        if (tagError) {
          console.error("태그 정보 조회 오류:", tagError);
          return {
            ...article,
            author_name: "관리자",
            tags: []
          };
        }

        const tags = tagsData?.map(item => item.tags) || [];
        
        return {
          ...article,
          author_name: "관리자", // 간단한 임시 값
          tags
        };
      })
    );

    return NextResponse.json<ApiResponse<Article[]>>({ 
      data: articles,
      success: true
    });
  } catch (error) {
    console.error("게시글 목록 가져오기 오류:", error);
    const apiError = handleApiError(error);
    return NextResponse.json<ApiResponse>({ 
      error: apiError,
      success: false 
    }, { status: 500 });
  }
} 