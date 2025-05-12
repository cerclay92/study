-- 0001_init_schema.sql
-- 기본 스키마와 테이블 생성

-- 트랜잭션 시작
BEGIN;

-- 공통 함수: updated_at 자동 업데이트 트리거 생성 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 사용자 관련 테이블 생성
DO $$
BEGIN
    -- 사용자 테이블
    CREATE TABLE IF NOT EXISTS public.users (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ
    );

    -- 사용자 테이블 업데이트 트리거
    DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
    CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    -- 관리자 테이블
    CREATE TABLE IF NOT EXISTS public.admins (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user tables: %', SQLERRM;
        RAISE;
END $$;

-- 콘텐츠 관련 테이블 생성
DO $$
BEGIN
    -- 카테고리 테이블
    CREATE TABLE IF NOT EXISTS public.categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ
    );

    -- 카테고리 테이블 업데이트 트리거
    DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
    CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    -- 게시글 테이블
    CREATE TABLE IF NOT EXISTS public.articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image TEXT,
        category_id INTEGER REFERENCES public.categories(id),
        author_id UUID REFERENCES public.admins(id),
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ
    );

    -- 게시글 테이블 업데이트 트리거
    DROP TRIGGER IF EXISTS set_articles_updated_at ON public.articles;
    CREATE TRIGGER set_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    -- 태그 테이블
    CREATE TABLE IF NOT EXISTS public.tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ
    );

    -- 태그 테이블 업데이트 트리거
    DROP TRIGGER IF EXISTS set_tags_updated_at ON public.tags;
    CREATE TRIGGER set_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    -- 게시글과 태그 연결 테이블
    CREATE TABLE IF NOT EXISTS public.article_tags (
        article_id INTEGER REFERENCES public.articles(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES public.tags(id) ON DELETE CASCADE,
        PRIMARY KEY (article_id, tag_id)
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating content tables: %', SQLERRM;
        RAISE;
END $$;

-- 댓글 테이블 생성
DO $$
BEGIN
    -- 댓글 테이블
    CREATE TABLE IF NOT EXISTS public.comments (
        id SERIAL PRIMARY KEY,
        article_id INTEGER REFERENCES public.articles(id) ON DELETE CASCADE,
        user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
        author_name TEXT, -- 비회원 댓글용
        author_email TEXT, -- 비회원 댓글용
        content TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        parent_id INTEGER REFERENCES public.comments(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ
    );

    -- 댓글 테이블 업데이트 트리거
    DROP TRIGGER IF EXISTS set_comments_updated_at ON public.comments;
    CREATE TRIGGER set_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating comment tables: %', SQLERRM;
        RAISE;
END $$;

-- 기본 카테고리 추가
INSERT INTO public.categories (name, description)
VALUES 
('에세이', '개인적인 경험과 생각을 담은 에세이 모음'),
('인문학', '인문학적 사고와 통찰을 담은 글'),
('문화', '문화적 현상과 트렌드에 관한 분석'),
('상담 사례', '다양한 심리 상담 사례와 해석'),
('인터뷰', '다양한 분야의 전문가 인터뷰')
ON CONFLICT (name) DO NOTHING;

-- 기본 태그 추가
INSERT INTO public.tags (name, description)
VALUES 
('독서', '독서와 관련된 글'),
('인문', '인문학적 주제를 다룬 글'),
('에세이', '개인적인 생각과 경험을 담은 글'),
('철학', '철학적 주제를 다룬 글'),
('심리학', '심리학적 주제를 다룬 글')
ON CONFLICT (name) DO NOTHING;

-- 트랜잭션 커밋
COMMIT; 