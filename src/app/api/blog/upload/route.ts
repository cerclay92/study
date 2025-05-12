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

    // FormData에서 파일 추출
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large" },
        { status: 400 }
      );
    }

    // 파일 이름 생성
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${timestamp}_${randomString}.${ext}`;
    const filePath = `uploads/${fileName}`;

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Supabase Storage에 업로드
    const { data, error } = await supabaseAdmin.storage
      .from('blog')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 공개 URL 가져오기
    const { data: publicUrl } = supabaseAdmin.storage
      .from('blog')
      .getPublicUrl(data.path);

    // uploads 테이블에 기록
    const { error: dbError } = await supabaseAdmin
      .from('uploads')
      .insert({
        file_name: fileName,
        file_path: data.path,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: session.user.id
      });

    if (dbError) {
      console.error("Database insert error:", dbError);
      // 업로드는 성공했으므로 에러를 기록만 하고 진행
    }

    return NextResponse.json({ url: publicUrl.publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 