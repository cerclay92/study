-- 0003_storage_setup.sql
-- Storage 버킷 설정

-- 트랜잭션 시작
BEGIN;

-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'blog',
  'blog',
  true,
  false,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책 설정
-- 누구나 읽기 가능
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog');

-- 관리자만 쓰기/삭제 가능
CREATE POLICY "Admin Insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'blog'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admin Update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'blog'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'blog'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

-- 트랜잭션 종료
COMMIT; 