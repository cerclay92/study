import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET 요청 처리: 게시글 목록 가져오기
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const supabase = createServerClient();

    let query = supabase
      .from("articles")
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        created_at,
        category_id,
        published,
        views
      `)
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (category) {
      query = query.eq("category_id", category);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error("Error fetching articles:", error);
      return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error in articles API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 