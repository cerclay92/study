import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET 요청 처리: 단일 게시글 가져오기
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const supabase = createServerClient();
    
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
      return NextResponse.json(
        { error: error.message }, 
        { status: 404 }
      );
    }

    // 태그 정보 가져오기
    const { data: tagsData } = await supabase
      .from("article_tags")
      .select("tags(*)")
      .eq("article_id", data.id);

    const tags = tagsData?.map(item => item.tags) || [];

    // 클라이언트에 전송할 최종 데이터
    const article = {
      ...data,
      author_name: "관리자", // 간단한 임시 값
      tags
    };

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error("게시글 가져오기 오류:", error);
    return NextResponse.json(
      { error: "게시글을 가져오는 중 오류가 발생했습니다." }, 
      { status: 500 }
    );
  }
} 