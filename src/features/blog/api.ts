"use client";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { PostgrestError } from "@supabase/supabase-js";

// 타입 정의
export type ArticleWithCategory = Database["public"]["Tables"]["articles"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"];
  author_name: string | null;
  tags: Database["public"]["Tables"]["tags"]["Row"][];
};

export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Draft = Database["public"]["Tables"]["drafts"]["Row"];
export type BlogSetting = Database["public"]["Tables"]["blog_settings"]["Row"];

// API 응답 타입
type ApiResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// 게시글 목록 가져오기 - 클라이언트
export async function getArticles(
  page: number = 1,
  limit: number = 10,
  categoryId?: number,
  tagId?: number,
  searchQuery?: string
): Promise<ApiResponse<ArticleWithCategory[]>> {
  try {
    // API 라우트를 통해 서버에서 데이터 가져오기
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (tagId) params.append('tagId', tagId.toString());
    if (searchQuery) params.append('searchQuery', searchQuery);
    
    const response = await fetch(`/api/blog/articles?${params}`);
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(result.error) };
    }
    
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// 단일 게시글 가져오기 - 클라이언트
export async function getArticleBySlug(slug: string): Promise<ApiResponse<ArticleWithCategory>> {
  try {
    // API 라우트를 통해 서버에서 데이터 가져오기
    const response = await fetch(`/api/blog/article/${slug}`);
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(result.error) };
    }
    
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// 블로그 설정 가져오기 - 클라이언트
export async function getBlogSettings(): Promise<ApiResponse<BlogSetting[]>> {
  try {
    const response = await fetch('/api/blog/settings');
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(result.error) };
    }
    
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// 새 게시글 작성하기
export async function createArticle(
  article: Omit<Database["public"]["Tables"]["articles"]["Insert"], "id" | "created_at" | "updated_at" | "author_id">,
  tags?: number[]
): Promise<ApiResponse<number>> {
  try {
    console.log("createArticle 함수 호출됨:", JSON.stringify(article, null, 2));
    console.log("태그 정보:", tags);
    
    // 서버 API를 사용하여 게시글 생성
    const response = await fetch('/api/blog/article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        article: {
          title: article.title,
          content: article.content,
          slug: article.slug,
          excerpt: article.excerpt || null,
          category_id: article.category_id,
          featured_image: article.featured_image || null,
          published: article.published || false,
          published_at: article.published_at || null,
        },
        tags: tags,
      }),
    });
    
    const result = await response.json();
    console.log("서버 응답:", result);
    
    if (!response.ok) {
      console.error("게시글 저장 오류:", result.error);
      console.error("HTTP 상태 코드:", response.status);
      console.error("응답 헤더:", Object.fromEntries(response.headers.entries()));
      throw new Error(result.error || "게시글 저장에 실패했습니다");
    }
    
    return { data: result.id, error: null };
  } catch (error) {
    console.error("createArticle 함수 예외 발생:", error);
    if (error instanceof Error) {
      console.error("createArticle 함수 예외 상세:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

// 게시글 수정하기
export async function updateArticle(
  id: number,
  article: Omit<Database["public"]["Tables"]["articles"]["Update"], "id" | "created_at" | "updated_at" | "author_id">,
  tags?: number[]
): Promise<ApiResponse<null>> {
  try {
    console.log("updateArticle 함수 호출됨:", JSON.stringify(article, null, 2));
    console.log("게시글 ID:", id);
    console.log("태그 정보:", tags);
    
    // tags 필드가 article 객체에 포함되어 있을 경우를 처리
    const articleData = { ...article };
    // @ts-ignore - tags 필드가 타입에 없지만 실제로 전달될 수 있으므로 제거
    if (articleData.tags !== undefined) {
      // @ts-ignore
      delete articleData.tags;
      console.log("article 객체에서 tags 필드 제거");
    }
    
    // 서버 API를 사용하여 게시글 수정
    const response = await fetch('/api/blog/article', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        article: articleData,
        tags,
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error("게시글 업데이트 오류:", result.error);
      return { data: null, error: new Error(result.error) };
    }
    
    return { data: null, error: null };
  } catch (error) {
    console.error("updateArticle 함수 예외 발생:", error);
    console.error("updateArticle 함수 예외 상세:", JSON.stringify(error));
    return { data: null, error: error as Error };
  }
}

// 게시글 삭제하기
export async function deleteArticle(id: number): Promise<ApiResponse<null>> {
  try {
    const supabase = createClient();
    
    // 게시글 삭제 (관련 태그, 댓글 등은 CASCADE로 자동 삭제)
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    return { data: null, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// 임시저장 글 목록 가져오기
export async function getDrafts(): Promise<ApiResponse<Draft[]>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("drafts")
      .select("*")
      .order("updated_at", { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// 임시저장 글 가져오기
export async function getDraft(id: number): Promise<ApiResponse<Draft>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("drafts")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// 임시저장하기
export async function saveDraft(
  draft: Omit<Database["public"]["Tables"]["drafts"]["Insert"], "id" | "created_at" | "updated_at" | "author_id">
): Promise<ApiResponse<number>> {
  try {
    console.log("saveDraft 함수 호출됨:", JSON.stringify(draft, null, 2));
    
    // 서버 API를 사용하여 임시저장
    const response = await fetch('/api/blog/draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draft),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error("임시저장 오류:", result.error);
      return { data: null, error: new Error(result.error) };
    }
    
    return { data: result.id, error: null };
  } catch (error) {
    console.error("saveDraft 함수 예외 발생:", error);
    console.error("saveDraft 함수 예외 상세:", JSON.stringify(error));
    return { data: null, error: error as Error };
  }
}

// 임시저장 글 업데이트
export async function updateDraft(
  id: number,
  draft: Omit<Database["public"]["Tables"]["drafts"]["Update"], "id" | "created_at" | "updated_at" | "author_id">
): Promise<ApiResponse<null>> {
  try {
    // 서버 API를 사용하여 임시저장 업데이트
    const response = await fetch('/api/blog/draft', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        draft,
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error("임시저장 업데이트 오류:", result.error);
      return { data: null, error: new Error(result.error) };
    }
    
    return { data: null, error: null };
  } catch (error) {
    console.error("updateDraft 함수 예외 발생:", error);
    console.error("updateDraft 함수 예외 상세:", JSON.stringify(error));
    return { data: null, error: error as Error };
  }
}

// 임시저장 글 삭제
export async function deleteDraft(id: number): Promise<ApiResponse<null>> {
  try {
    // 서버 API를 사용하여 임시저장 삭제
    const response = await fetch(`/api/blog/draft?id=${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error("임시저장 삭제 오류:", result.error);
      return { data: null, error: new Error(result.error) };
    }
    
    return { data: null, error: null };
  } catch (error) {
    console.error("deleteDraft 함수 예외 발생:", error);
    console.error("deleteDraft 함수 예외 상세:", JSON.stringify(error));
    return { data: null, error: error as Error };
  }
}

// 댓글 목록 가져오기
export async function getComments(articleId: number): Promise<ApiResponse<Comment[]>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", articleId)
      .eq("is_approved", true)
      .order("created_at", { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// 댓글 작성하기
export async function createComment(
  comment: Omit<Database["public"]["Tables"]["comments"]["Insert"], "id" | "created_at" | "is_approved">
): Promise<ApiResponse<null>> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from("comments")
      .insert(comment);

    return { data: null, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// 모든 태그 가져오기
export async function getTags(): Promise<ApiResponse<Tag[]>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name");

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// 태그 생성하기
export async function createTag(
  tag: Omit<Database["public"]["Tables"]["tags"]["Insert"], "id" | "created_at">
): Promise<ApiResponse<number>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("tags")
      .insert(tag)
      .select("id")
      .single();

    return { data: data?.id || null, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// 파일 업로드
export async function uploadFile(file: File): Promise<ApiResponse<string>> {
  try {
    console.log("파일 업로드 시작:", file.name);
    
    // 파일 확장자 추출 및 유효성 검사
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
      return { 
        data: null, 
        error: new Error('지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)') 
      };
    }

    // 파일 크기 검사 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return {
        data: null,
        error: new Error('파일 크기는 10MB를 초과할 수 없습니다.')
      };
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);

    // 서버 API를 통해 파일 업로드
    const response = await fetch('/api/blog/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("파일 업로드 오류:", result.error);
      return { data: null, error: new Error(result.error) };
    }

    if (!result.url) {
      console.error("업로드된 파일 URL을 찾을 수 없음");
      return { 
        data: null, 
        error: new Error('파일이 업로드되었으나 URL을 찾을 수 없습니다.') 
      };
    }

    console.log("업로드 성공, URL:", result.url);
    return { data: result.url, error: null };
  } catch (error) {
    console.error("파일 업로드 예외 발생:", error);
    return { data: null, error: error as Error };
  }
}

// 방문자 통계 기록
export async function recordVisit(
  articleId: number,
  pagePath: string
): Promise<ApiResponse<null>> {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    
    // 현재 통계 조회
    const { data, error } = await supabase
      .from("visit_statistics")
      .select("*")
      .eq("date", today)
      .eq("page_path", pagePath)
      .maybeSingle();
    
    if (error) {
      return { data: null, error };
    }
    
    if (data) {
      // 기존 레코드 업데이트
      const { error: updateError } = await supabase
        .from("visit_statistics")
        .update({
          visitor_count: data.visitor_count + 1
        })
        .eq("id", data.id);
      
      return { data: null, error: updateError };
    } else {
      // 새로운 레코드 생성
      const { error: insertError } = await supabase
        .from("visit_statistics")
        .insert({
          date: today,
          page_path: pagePath,
          article_id: articleId,
          visitor_count: 1,
          unique_visitors: 1
        });
      
      return { data: null, error: insertError };
    }
  } catch (error) {
    return { data: null, error: error as Error };
  }
} 