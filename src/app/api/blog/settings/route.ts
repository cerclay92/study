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
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from("blog_settings")
      .select("*");

    if (error) {
      const apiError = handleApiError(error);
      return NextResponse.json<ApiResponse>({ 
        error: apiError,
        success: false 
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<BlogSettings[]>>({ 
      data,
      success: true 
    });
  } catch (error) {
    console.error("블로그 설정 가져오기 오류:", error);
    const apiError = handleApiError(error);
    return NextResponse.json<ApiResponse>({ 
      error: apiError,
      success: false 
    }, { status: 500 });
  }
} 