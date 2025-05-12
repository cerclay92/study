-- 0003_security_and_functions.sql
-- RLS 정책 및 함수 설정

-- 트랜잭션 시작
BEGIN;

-- RLS 적용: 사용자 및 인증 테이블
DO $$
BEGIN
    -- 사용자 테이블 RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "사용자는 자신의 데이터만 볼 수 있음" ON public.users;
    CREATE POLICY "사용자는 자신의 데이터만 볼 수 있음" ON public.users
        FOR SELECT USING (auth.uid() = id);
    
    DROP POLICY IF EXISTS "관리자만 사용자 데이터를 수정할 수 있음" ON public.users;
    CREATE POLICY "관리자만 사용자 데이터를 수정할 수 있음" ON public.users
        FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.admins));
    
    DROP POLICY IF EXISTS "관리자만 사용자 데이터를 삭제할 수 있음" ON public.users;
    CREATE POLICY "관리자만 사용자 데이터를 삭제할 수 있음" ON public.users
        FOR DELETE USING (auth.uid() IN (SELECT id FROM public.admins));

    -- 구독 테이블 RLS
    ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "구독자는 자신의 구독 정보만 볼 수 있음" ON public.subscriptions;
    CREATE POLICY "구독자는 자신의 구독 정보만 볼 수 있음" ON public.subscriptions
        FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.admins));
    
    DROP POLICY IF EXISTS "관리자만 구독 정보를 추가/수정/삭제할 수 있음" ON public.subscriptions;
    CREATE POLICY "관리자만 구독 정보를 추가/수정/삭제할 수 있음" ON public.subscriptions
        USING (auth.uid() IN (SELECT id FROM public.admins));

    -- 결제 테이블 RLS
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "사용자는 자신의 결제 정보만 볼 수 있음" ON public.payments;
    CREATE POLICY "사용자는 자신의 결제 정보만 볼 수 있음" ON public.payments
        FOR SELECT USING (auth.uid() IN (
            SELECT user_id FROM public.subscriptions 
            WHERE id = payments.subscription_id
        ) OR auth.uid() IN (SELECT id FROM public.admins));
    
    DROP POLICY IF EXISTS "관리자만 결제 정보를 추가/수정/삭제할 수 있음" ON public.payments;
    CREATE POLICY "관리자만 결제 정보를 추가/수정/삭제할 수 있음" ON public.payments
        USING (auth.uid() IN (SELECT id FROM public.admins));

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error setting up user/auth RLS: %', SQLERRM;
        RAISE;
END $$;

-- RLS 적용: 콘텐츠 테이블
DO $$
BEGIN
    -- 게시글 테이블 RLS
    ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "게시글은 모두 볼 수 있음" ON public.articles;
    CREATE POLICY "게시글은 모두 볼 수 있음" ON public.articles
        FOR SELECT USING (published = true OR auth.uid() IN (SELECT id FROM public.admins));
    
    DROP POLICY IF EXISTS "관리자만 게시글을 추가/수정/삭제할 수 있음" ON public.articles;
    CREATE POLICY "관리자만 게시글을 추가/수정/삭제할 수 있음" ON public.articles
        USING (auth.uid() IN (SELECT id FROM public.admins));

    -- 태그 테이블 RLS
    ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "태그는 모두 볼 수 있음" ON public.tags;
    CREATE POLICY "태그는 모두 볼 수 있음" ON public.tags 
        FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "관리자만 태그를 추가/수정/삭제할 수 있음" ON public.tags;
    CREATE POLICY "관리자만 태그를 추가/수정/삭제할 수 있음" ON public.tags 
        USING (auth.uid() IN (SELECT id FROM public.admins));

    -- 게시글-태그 테이블 RLS
    ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "게시글 태그는 모두 볼 수 있음" ON public.article_tags;
    CREATE POLICY "게시글 태그는 모두 볼 수 있음" ON public.article_tags 
        FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "관리자만 게시글 태그를 추가/수정/삭제할 수 있음" ON public.article_tags;
    CREATE POLICY "관리자만 게시글 태그를 추가/수정/삭제할 수 있음" ON public.article_tags 
        USING (auth.uid() IN (SELECT id FROM public.admins));

    -- 카테고리 테이블 RLS
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "카테고리는 모두 볼 수 있음" ON public.categories;
    CREATE POLICY "카테고리는 모두 볼 수 있음" ON public.categories 
        FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "관리자만 카테고리를 추가/수정/삭제할 수 있음" ON public.categories;
    CREATE POLICY "관리자만 카테고리를 추가/수정/삭제할 수 있음" ON public.categories 
        USING (auth.uid() IN (SELECT id FROM public.admins));

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error setting up content RLS: %', SQLERRM;
        RAISE;
END $$;

-- RLS 적용: 댓글 및 사용자 인터랙션 테이블
DO $$
BEGIN
    -- 댓글 테이블 RLS
    ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "승인된 댓글은 모두 볼 수 있음" ON public.comments;
    CREATE POLICY "승인된 댓글은 모두 볼 수 있음" ON public.comments 
        FOR SELECT USING (is_approved = true OR auth.uid() IN (SELECT id FROM public.admins));
    
    DROP POLICY IF EXISTS "인증된 사용자만 댓글 작성 가능" ON public.comments;
    CREATE POLICY "인증된 사용자만 댓글 작성 가능" ON public.comments 
        FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR (author_name IS NOT NULL AND author_email IS NOT NULL));
    
    DROP POLICY IF EXISTS "사용자는 자신의 댓글만 수정할 수 있음" ON public.comments;
    CREATE POLICY "사용자는 자신의 댓글만 수정할 수 있음" ON public.comments 
        FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.admins));
    
    DROP POLICY IF EXISTS "사용자는 자신의 댓글만 삭제할 수 있음" ON public.comments;
    CREATE POLICY "사용자는 자신의 댓글만 삭제할 수 있음" ON public.comments 
        FOR DELETE USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.admins));

    -- 좋아요 테이블 RLS
    ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "좋아요는 모두 추가할 수 있음" ON public.likes;
    CREATE POLICY "좋아요는 모두 추가할 수 있음" ON public.likes
        FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "좋아요는 모두 볼 수 있음" ON public.likes;
    CREATE POLICY "좋아요는 모두 볼 수 있음" ON public.likes
        FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "좋아요는 본인만 취소할 수 있음" ON public.likes;
    CREATE POLICY "좋아요는 본인만 취소할 수 있음" ON public.likes
        FOR DELETE USING (
            CASE 
                WHEN auth.uid() IS NOT NULL THEN client_id = auth.uid()::text
                ELSE client_id = current_setting('client.id', true)
            END
        );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error setting up comment/interaction RLS: %', SQLERRM;
        RAISE;
END $$;

-- RLS 적용: 블로그 관리 테이블
DO $$
BEGIN
    -- 블로그 설정 테이블 RLS
    ALTER TABLE public.blog_settings ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "블로그 설정은 모두 볼 수 있음" ON public.blog_settings;
    CREATE POLICY "블로그 설정은 모두 볼 수 있음" ON public.blog_settings 
        FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "관리자만 블로그 설정을 추가/수정/삭제할 수 있음" ON public.blog_settings;
    CREATE POLICY "관리자만 블로그 설정을 추가/수정/삭제할 수 있음" ON public.blog_settings 
        USING (auth.uid() IN (SELECT id FROM public.admins));

    -- 임시저장 글 테이블 RLS
    ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "작성자만 임시저장 글을 볼 수 있음" ON public.drafts;
    CREATE POLICY "작성자만 임시저장 글을 볼 수 있음" ON public.drafts 
        FOR SELECT USING (auth.uid() = author_id OR auth.uid() IN (SELECT id FROM public.admins));
    
    DROP POLICY IF EXISTS "작성자만 임시저장 글을 추가/수정/삭제할 수 있음" ON public.drafts;
    CREATE POLICY "작성자만 임시저장 글을 추가/수정/삭제할 수 있음" ON public.drafts 
        USING (auth.uid() = author_id OR auth.uid() IN (SELECT id FROM public.admins));

    -- 업로드 파일 테이블 RLS
    ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "관리자만 업로드 파일을 볼 수 있음" ON public.uploads;
    CREATE POLICY "관리자만 업로드 파일을 볼 수 있음" ON public.uploads 
        FOR SELECT USING (auth.uid() IN (SELECT id FROM public.admins));
    
    DROP POLICY IF EXISTS "관리자만 파일을 업로드할 수 있음" ON public.uploads;
    CREATE POLICY "관리자만 파일을 업로드할 수 있음" ON public.uploads 
        USING (auth.uid() IN (SELECT id FROM public.admins));

    -- 이메일 로그 테이블 RLS
    ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "관리자만 이메일 로그를 볼 수 있음" ON public.email_logs;
    CREATE POLICY "관리자만 이메일 로그를 볼 수 있음" ON public.email_logs
        FOR SELECT USING (auth.uid() IN (SELECT id FROM public.admins));
    
    DROP POLICY IF EXISTS "관리자만 이메일 로그를 추가/수정/삭제할 수 있음" ON public.email_logs;
    CREATE POLICY "관리자만 이메일 로그를 추가/수정/삭제할 수 있음" ON public.email_logs
        USING (auth.uid() IN (SELECT id FROM public.admins));

    -- 방문자 통계 테이블 RLS
    ALTER TABLE public.visit_statistics ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "통계는 관리자만 볼 수 있음" ON public.visit_statistics;
    CREATE POLICY "통계는 관리자만 볼 수 있음" ON public.visit_statistics 
        FOR SELECT USING (auth.uid() IN (SELECT id FROM public.admins));
    
    DROP POLICY IF EXISTS "관리자만 통계를 추가/수정할 수 있음" ON public.visit_statistics;
    CREATE POLICY "관리자만 통계를 추가/수정할 수 있음" ON public.visit_statistics 
        USING (auth.uid() IN (SELECT id FROM public.admins));

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error setting up management RLS: %', SQLERRM;
        RAISE;
END $$;

-- 페이지 방문 카운트 증가 함수
CREATE OR REPLACE FUNCTION increment_page_view(
    article_id_param INTEGER,
    page_path_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    today DATE := CURRENT_DATE;
    record_exists BOOLEAN;
BEGIN
    -- 해당 날짜와 페이지 경로에 대한 기록이 있는지 확인
    SELECT EXISTS (
        SELECT 1 FROM visit_statistics
        WHERE date = today AND page_path = page_path_param
    ) INTO record_exists;
    
    IF record_exists THEN
        -- 기존 레코드가 있으면 방문자 수 증가
        UPDATE visit_statistics
        SET visitor_count = visitor_count + 1
        WHERE date = today AND page_path = page_path_param;
    ELSE
        -- 새 레코드 생성
        INSERT INTO visit_statistics (
            date, 
            page_path, 
            article_id, 
            visitor_count, 
            unique_visitors
        )
        VALUES (
            today, 
            page_path_param, 
            article_id_param, 
            1, 
            1
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in increment_page_view: %', SQLERRM;
        RAISE;
END;
$$;

-- 임시저장 글을 게시글로 변환하는 함수
CREATE OR REPLACE FUNCTION convert_draft_to_article(
    draft_id_param INTEGER,
    slug_param TEXT,
    published_param BOOLEAN DEFAULT true
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_draft public.drafts;
    v_article_id INTEGER;
BEGIN
    -- 임시저장 글 가져오기
    SELECT * INTO v_draft
    FROM public.drafts
    WHERE id = draft_id_param;
    
    IF v_draft IS NULL THEN
        RAISE EXCEPTION 'Draft with ID % not found', draft_id_param;
    END IF;
    
    -- 게시글 생성
    INSERT INTO public.articles(
        title,
        slug,
        content,
        category_id,
        author_id,
        published,
        published_at,
        created_at,
        updated_at
    )
    VALUES(
        v_draft.title,
        slug_param,
        v_draft.content,
        v_draft.category_id,
        v_draft.author_id,
        published_param,
        CASE WHEN published_param THEN now() ELSE NULL END,
        v_draft.created_at,
        now()
    )
    RETURNING id INTO v_article_id;
    
    -- 임시저장 글 삭제
    DELETE FROM public.drafts
    WHERE id = draft_id_param;
    
    RETURN v_article_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in convert_draft_to_article: %', SQLERRM;
        RAISE;
END;
$$;

-- 트랜잭션 커밋
COMMIT; 