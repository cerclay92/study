import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Database } from "@/lib/supabase/types";

// 서버 측에서 사용할 Supabase 클라이언트 (Service Role 사용)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// 게시글 생성 API
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/blog/article - 요청 시작");
    
    // 세션 확인으로 인증
    const session = await getServerSession(authOptions);
    console.log("세션 정보:", JSON.stringify(session, null, 2));
    
    if (!session?.user?.id || session.user.role !== "admin") {
      console.error("인증 실패:", { 
        userId: session?.user?.id, 
        userRole: session?.user?.role 
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // author_id는 반드시 uuid여야 함
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(session.user.id)) {
      console.error("세션 user.id가 uuid 형식이 아님:", session.user.id);
      return NextResponse.json(
        { error: "세션 user.id가 uuid 형식이 아닙니다. 관리자 계정 마이그레이션을 확인하세요." },
        { status: 500 }
      );
    }
    
    const { article, tags } = await request.json();
    console.log("요청 본문:", JSON.stringify({ article, tags }, null, 2));
    
    if (!article) {
      console.error("게시글 데이터가 없습니다");
      return NextResponse.json(
        { error: "게시글 데이터가 필요합니다" },
        { status: 400 }
      );
    }
    
    // 필수 필드 검증
    const requiredFields = ["title", "content", "slug", "category_id"];
    const missingFields = requiredFields.filter(field => !article[field]);
    
    if (missingFields.length > 0) {
      console.error("필수 필드 누락:", missingFields);
      return NextResponse.json(
        { error: `다음 필드가 필요합니다: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }
    
    // 중복 슬러그 체크
    const { data: existingArticle, error: slugCheckError } = await supabaseAdmin
      .from("articles")
      .select("id")
      .eq("slug", article.slug)
      .single();
      
    if (slugCheckError && slugCheckError.code !== "PGRST116") {
      console.error("슬러그 중복 체크 오류:", slugCheckError);
      return NextResponse.json(
        { error: "슬러그 중복 체크 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }
    
    if (existingArticle) {
      console.error("중복된 슬러그:", article.slug);
      return NextResponse.json(
        { error: "이미 사용 중인 슬러그입니다" },
        { status: 400 }
      );
    }
    
    // 게시글 데이터 준비
    const articleData = {
      title: article.title,
      content: article.content,
      slug: article.slug,
      excerpt: article.excerpt || null,
      category_id: article.category_id,
      featured_image: article.featured_image || null,
      published: article.published || false,
      published_at: article.published_at || null,
      author_id: session.user.id,  // 세션에서 가져온 실제 사용자 ID 사용
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log("저장할 게시글 데이터:", JSON.stringify(articleData, null, 2));
    
    // 게시글 저장 (Service Role로 RLS 우회)
    const { data, error } = await supabaseAdmin
      .from("articles")
      .insert(articleData)
      .select("id")
      .single();
      
    if (error) {
      console.error("게시글 저장 오류:", error);
      console.error("게시글 저장 오류 상세:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    console.log("게시글 저장 성공. ID:", data.id);
    
    // 태그가 있다면 저장
    if (tags && tags.length > 0) {
      console.log("태그 저장 시작:", tags);
      
      const tagItems = tags.map((tagId: number) => ({
        article_id: data.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabaseAdmin
        .from("article_tags")
        .insert(tagItems);
        
      if (tagError) {
        console.error("태그 저장 오류:", tagError);
        // 게시글은 이미 저장되었으므로 태그 오류는 경고만 표시
      } else {
        console.log("태그 저장 성공");
      }
    }
    
    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("서버 API 예외 발생:", error);
    console.error("서버 API 예외 상세:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 게시글 업데이트 API
export async function PUT(request: NextRequest) {
  try {
    // 세션 확인으로 인증
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 요청 데이터 파싱
    const { id, article, tags } = await request.json();
    
    console.log("서버 API - 게시글 업데이트:", { id, article });
    console.log("서버 API - 태그:", tags);
    
    const articleData = {
      ...article,
      author_id: session.user.id,  // 세션에서 가져온 실제 사용자 ID 사용
      updated_at: new Date().toISOString(),
    };
    
    // 슬러그 중복 확인 (자기 자신은 제외)
    if (articleData.slug) {
      const { data: existingArticle } = await supabaseAdmin
        .from("articles")
        .select("id, slug")
        .eq("slug", articleData.slug)
        .neq("id", id)
        .maybeSingle();
      
      // 중복된 슬러그가 있으면 타임스탬프를 추가하여 고유성 보장
      if (existingArticle) {
        const timestamp = new Date().getTime();
        articleData.slug = `${articleData.slug}-${timestamp.toString().slice(-8)}`;
        console.log("서버 API - 슬러그 중복 발견, 새 슬러그로 변경:", articleData.slug);
      }
    }
    
    // 게시글 업데이트 (Service Role로 RLS 우회)
    const { error } = await supabaseAdmin
      .from("articles")
      .update(articleData)
      .eq("id", id);
      
    if (error) {
      console.error("서버 API - 게시글 업데이트 오류:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // 태그가 있다면 기존 태그 삭제 후 새로 저장
    if (tags) {
      // 기존 태그 삭제
      const { error: deleteError } = await supabaseAdmin
        .from("article_tags")
        .delete()
        .eq("article_id", id);
        
      if (deleteError) {
        console.error("서버 API - 태그 삭제 오류:", deleteError);
        // 게시글은 이미 업데이트되었으므로 태그 오류는 경고만 표시
      }
      
      // 새 태그 저장
      if (tags.length > 0) {
        const tagItems = tags.map((tagId: number) => ({
          article_id: id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabaseAdmin
          .from("article_tags")
          .insert(tagItems);
          
        if (tagError) {
          console.error("서버 API - 태그 저장 오류:", tagError);
          // 게시글은 이미 업데이트되었으므로 태그 오류는 경고만 표시
        }
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("서버 API - 예외 발생:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 게시글 삭제 API
export async function DELETE(request: NextRequest) {
  try {
    // 세션 확인으로 인증
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // URL에서 ID 추출
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }
    
    console.log("서버 API - 게시글 삭제:", id);
    
    // 게시글 삭제 (Service Role로 RLS 우회)
    const { error } = await supabaseAdmin
      .from("articles")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("서버 API - 게시글 삭제 오류:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("서버 API - 예외 발생:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 