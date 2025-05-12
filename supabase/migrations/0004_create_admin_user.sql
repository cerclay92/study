-- 0004_create_admin_user.sql
-- Auth 사용자 및 관리자 사용자 생성

-- 트랜잭션 시작
BEGIN;

-- 관리자 사용자 생성
DO $$
BEGIN
    -- auth.users 테이블에 관리자 추가
    INSERT INTO auth.users (
        id,
        email,
        email_confirmed_at,
        created_at,
        updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'admin@example.com',
        now(),
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- public.users 테이블에 관리자 추가
    INSERT INTO public.users (
        id,
        email,
        full_name,
        created_at,
        updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'admin@example.com',
        '관리자',
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- 관리자 테이블에 추가
    INSERT INTO public.admins (
        id,
        created_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- 관리자 ID를 사용하는 기존 게시글 및 임시저장 데이터 확인 및 업데이트
    UPDATE public.articles
    SET author_id = '00000000-0000-0000-0000-000000000000'
    WHERE author_id IS NULL;
    
    UPDATE public.drafts
    SET author_id = '00000000-0000-0000-0000-000000000000'
    WHERE author_id IS NULL;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating admin user: %', SQLERRM;
        RAISE;
END $$;

-- 트랜잭션 커밋
COMMIT; 