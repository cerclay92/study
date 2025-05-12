-- 설명: 게시글 조회수 관리를 위한 views 컬럼 및 증가 함수 추가
-- 작성일: 2024-05-22

BEGIN;

-- 게시글 테이블에 조회수 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'views'
  ) THEN
    ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0;
  END IF;
END $$;

-- 조회수 증가 함수 추가
CREATE OR REPLACE FUNCTION increment_page_view(article_id_param INTEGER, page_path_param TEXT)
RETURNS VOID AS $$
BEGIN
  -- 게시글 조회수 증가
  UPDATE articles
  SET views = views + 1,
      updated_at = now()
  WHERE id = article_id_param;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating view count: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMIT; 