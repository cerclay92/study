import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ApiResponse, handleApiError } from "@/lib/types/error";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

interface Article {
  id: number;
  title: string;
  content: string;
  slug: string;
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

// GET 요청 처리: 단일 게시글 가져오기
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const supabase = await createServerClient();
    
    // 게시글 데이터 조회
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        categories:category_id(*)
      `)
      .eq("slug", slug)
      .single();

    if (error) {
      throw error;
    }

    // 태그 정보 가져오기
    const { data: tagsData, error: tagError } = await supabase
      .from("article_tags")
      .select("tags(*)")
      .eq("article_id", data.id);

    if (tagError) {
      console.error("태그 정보 조회 오류:", tagError);
    }

    const tags = tagsData?.map(item => item.tags) || [];

    // 클라이언트에 전송할 최종 데이터
    const article: Article = {
      ...data,
      author_name: "관리자", // 간단한 임시 값
      tags
    };

    return NextResponse.json<ApiResponse<Article>>({ 
      data: article,
      success: true 
    });
  } catch (error) {
    console.error("서버 API 예외 발생:", error);
    if (error instanceof Error) {
      console.error("서버 API 예외 상세:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 