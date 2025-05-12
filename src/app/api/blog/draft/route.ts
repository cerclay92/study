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

// 임시저장 API
export async function POST(request: NextRequest) {
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
    const draft = await request.json();
    
    console.log("서버 API - 임시저장:", draft);
    
    const draftData = {
      ...draft,
      author_id: session.user.id,  // 세션에서 가져온 실제 사용자 ID 사용
      updated_at: new Date().toISOString()
    };
    
    // 임시저장 (Service Role로 RLS 우회)
    const { data, error } = await supabaseAdmin
      .from("drafts")
      .insert(draftData)
      .select("id")
      .single();
      
    if (error) {
      console.error("서버 API - 임시저장 오류:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("서버 API - 예외 발생:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 임시저장 업데이트 API
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
    const { id, draft } = await request.json();
    
    console.log("서버 API - 임시저장 업데이트:", { id, draft });
    
    const draftData = {
      ...draft,
      author_id: session.user.id,  // 세션에서 가져온 실제 사용자 ID 사용
      updated_at: new Date().toISOString(),
    };
    
    // 임시저장 업데이트 (Service Role로 RLS 우회)
    const { error } = await supabaseAdmin
      .from("drafts")
      .update(draftData)
      .eq("id", id);
      
    if (error) {
      console.error("서버 API - 임시저장 업데이트 오류:", error);
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

// 임시저장 삭제 API
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
    
    console.log("서버 API - 임시저장 삭제:", id);
    
    // 임시저장 삭제 (Service Role로 RLS 우회)
    const { error } = await supabaseAdmin
      .from("drafts")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("서버 API - 임시저장 삭제 오류:", error);
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