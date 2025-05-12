import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) {
        throw categoriesError;
      }

      return NextResponse.json({ 
        success: true,
        data: categories
      });
    } catch (error) {
      console.error("데이터베이스 쿼리 오류:", error);
      if (error instanceof Error) {
        console.error("데이터베이스 쿼리 오류 상세:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
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