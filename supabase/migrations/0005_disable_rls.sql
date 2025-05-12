-- 0005_disable_rls.sql
-- RLS 정책 임시 비활성화 (개발용)

-- 트랜잭션 시작
BEGIN;

-- RLS 정책 비활성화
DO $$
BEGIN
    -- 게시글 테이블 RLS 비활성화
    ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;

    -- 태그 관련 테이블 RLS 비활성화
    ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.article_tags DISABLE ROW LEVEL SECURITY;

    -- 카테고리 테이블 RLS 비활성화
    ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

    -- 임시저장 관련 테이블 RLS 비활성화
    ALTER TABLE public.drafts DISABLE ROW LEVEL SECURITY;

    -- 기타 필요한 테이블 RLS 비활성화
    ALTER TABLE public.blog_settings DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.uploads DISABLE ROW LEVEL SECURITY;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error disabling RLS: %', SQLERRM;
        RAISE;
END $$;

-- 트랜잭션 커밋
COMMIT; 