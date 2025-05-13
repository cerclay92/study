import { createServerClient } from "@/lib/supabase/server";
<<<<<<< HEAD
import { NextResponse } from "next/server";
=======
import { ApiResponse, handleApiError } from "@/lib/types/error";

interface Article {
  id: number;
  title: string;
  content: string;
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
>>>>>>> e93acc1ca4550f1cf3f40f87f92b385f82480fc0

// GET 요청 처리: 게시글 목록 가져오기
export async function GET(request: Request) {
  try {
<<<<<<< HEAD
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const supabase = createServerClient();
=======
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const categoryId = searchParams.get("categoryId") ? parseInt(searchParams.get("categoryId")!) : undefined;
    const search = searchParams.get("search") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const published = searchParams.get("published") === "true";

    const supabase = await createServerClient();
>>>>>>> e93acc1ca4550f1cf3f40f87f92b385f82480fc0

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
<<<<<<< HEAD
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
=======
      .order("created_at", { ascending: false });

    // 필터 적용
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    if (published !== undefined) {
      query = query.eq("published", published);
    }

    // 페이지네이션 적용
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // 태그 필터링 및 정보 가져오기
    let filteredArticles = data;
    
    if (tag) {
      const { data: taggedArticles, error: tagError } = await supabase
        .from("article_tags")
        .select("article_id")
        .eq("tag_id", tag);

      if (tagError) {
        const apiError = handleApiError(tagError);
        return NextResponse.json<ApiResponse>({ error: apiError }, { status: 500 });
      }

      if (taggedArticles) {
        const articleIds = taggedArticles.map(item => item.article_id);
        filteredArticles = data.filter(article => 
          articleIds.includes(article.id)
        );
      }
    }

    // 각 게시글의 태그 정보 가져오기
    const articles = await Promise.all(
      filteredArticles.map(async article => {
        const { data: tagsData, error: tagError } = await supabase
          .from("article_tags")
          .select("tags(*)")
          .eq("article_id", article.id);

        if (tagError) {
          console.error("태그 정보 조회 오류:", tagError);
          return {
            ...article,
            author_name: "관리자",
            tags: []
          };
        }

        const tags = tagsData?.map(item => item.tags) || [];
        
        return {
          ...article,
          author_name: "관리자", // 간단한 임시 값
          tags
        };
      })
    );

    return NextResponse.json<ApiResponse<Article[]>>({ 
      data: articles,
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
>>>>>>> e93acc1ca4550f1cf3f40f87f92b385f82480fc0
  }
} 