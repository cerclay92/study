import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET 요청 처리: 블로그 설정 가져오기
export async function GET(_request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from("blog_settings")
      .select("*");

    if (error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("블로그 설정 가져오기 오류:", error);
    return NextResponse.json(
      { error: "블로그 설정을 가져오는 중 오류가 발생했습니다." }, 
      { status: 500 }
    );
  }
} 