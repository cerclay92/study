-- 0002_blog_features.sql
-- 블로그 기능 관련 테이블 생성

-- 트랜잭션 시작
BEGIN;

-- 블로그 기능 테이블 생성
DO $$
BEGIN
    -- 블로그 설정 테이블
    CREATE TABLE IF NOT EXISTS public.blog_settings (
        id SERIAL PRIMARY KEY,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT,
        description TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_by UUID REFERENCES public.admins(id)
    );

    -- 임시저장 글 테이블
    CREATE TABLE IF NOT EXISTS public.drafts (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        author_id UUID REFERENCES public.admins(id),
        category_id INTEGER REFERENCES public.categories(id),
        is_autosave BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- 임시저장 글 테이블 업데이트 트리거
    DROP TRIGGER IF EXISTS set_drafts_updated_at ON public.drafts;
    CREATE TRIGGER set_drafts_updated_at
    BEFORE UPDATE ON public.drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    -- 파일 업로드 테이블
    CREATE TABLE IF NOT EXISTS public.uploads (
        id SERIAL PRIMARY KEY,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        uploaded_by UUID REFERENCES public.admins(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- 좋아요 테이블
    CREATE TABLE IF NOT EXISTS public.likes (
        id SERIAL PRIMARY KEY,
        article_id INTEGER REFERENCES public.articles(id) ON DELETE CASCADE,
        client_id TEXT NOT NULL, -- 비회원도 좋아요할 수 있도록 클라이언트 ID 저장
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating blog feature tables: %', SQLERRM;
        RAISE;
END $$;

-- 통계 관련 테이블 생성
DO $$
BEGIN
    -- 방문자 통계 테이블
    CREATE TABLE IF NOT EXISTS public.visit_statistics (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        page_path TEXT NOT NULL,
        article_id INTEGER REFERENCES public.articles(id) ON DELETE CASCADE,
        visitor_count INTEGER NOT NULL DEFAULT 0,
        unique_visitors INTEGER NOT NULL DEFAULT 0,
        UNIQUE(date, page_path)
    );

    -- 이메일 발송 기록 테이블
    CREATE TABLE IF NOT EXISTS public.email_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES public.users(id),
        email_type TEXT NOT NULL,
        subject TEXT NOT NULL,
        sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        status TEXT NOT NULL
    );

    -- 구독 정보 테이블
    CREATE TABLE IF NOT EXISTS public.subscriptions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES public.users(id),
        plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
        status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
        start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
        end_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ
    );

    -- 구독 정보 테이블 업데이트 트리거
    DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
    CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    -- 결제 정보 테이블
    CREATE TABLE IF NOT EXISTS public.payments (
        id SERIAL PRIMARY KEY,
        subscription_id INTEGER REFERENCES public.subscriptions(id),
        amount INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        payment_id TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating statistics tables: %', SQLERRM;
        RAISE;
END $$;

-- 기본 데이터 추가
DO $$
BEGIN
    -- 기본 블로그 설정 추가
    INSERT INTO public.blog_settings (setting_key, setting_value, description)
    VALUES 
    ('blog_title', '서재, 사람을 잇다', '블로그 제목'),
    ('blog_description', '책과 사람, 그리고 만남을 잇는 온라인 인문학 매거진', '블로그 설명'),
    ('comment_approval_required', 'true', '댓글 승인 필요 여부'),
    ('posts_per_page', '10', '페이지당 게시글 수'),
    ('allow_guest_comments', 'true', '비회원 댓글 허용 여부')
    ON CONFLICT (setting_key) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting default data: %', SQLERRM;
        RAISE;
END $$;

-- 트랜잭션 커밋
COMMIT; 