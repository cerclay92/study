-- 0000_check_schema.sql
-- 스키마 검증용 (실행 후 결과만 확인, 변경 없음)

-- 테이블 목록 조회
SELECT 
    table_name, 
    table_schema
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;

-- 함수 목록 조회
SELECT 
    routine_name, 
    routine_schema
FROM 
    information_schema.routines
WHERE 
    routine_schema = 'public'
    AND routine_type = 'FUNCTION'
ORDER BY 
    routine_name;

-- RLS 정책 확인
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename, 
    policyname; 