import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ApiResponse, handleApiError } from "@/lib/types/error";

interface BlogSettings {
  id: number;
  site_title: string;
  site_description: string;
  site_keywords: string[];
  posts_per_page: number;
  created_at: string;
  updated_at: string;
}

// GET 요청 처리: 블로그 설정 가져오기
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from("blog_settings")
      .select("*");

    if (error) {
      throw error;
    }

    return NextResponse.json<ApiResponse<BlogSettings[]>>({ 
      data,
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