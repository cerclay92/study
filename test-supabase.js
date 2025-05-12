// Supabase 연결 테스트 스크립트
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 환경 변수 확인
console.log('===== 환경 변수 정보 =====');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5) + '...');
} else {
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY: 설정되지 않음');
}
console.log('=======================');

// 환경 변수에서 Supabase 정보 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 올바르게 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.');
  console.log('\n[올바른 형식]');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

// URL 형식 확인
if (!supabaseUrl.startsWith('https://')) {
  console.error('❌ Supabase URL 형식이 올바르지 않습니다.');
  console.error('URL은 https://로 시작해야 합니다. 현재 값:', supabaseUrl);
  console.error('Supabase 대시보드에서 Project Settings > API > Project URL을 확인하세요.');
  process.exit(1);
}

try {
  // Supabase 클라이언트 생성
  console.log('Supabase 클라이언트 생성 중...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 테스트 함수
  async function testConnection() {
    try {
      console.log('articles 테이블에 쿼리 시도 중...');
      // 간단한 쿼리 실행
      const { data, error } = await supabase.from('articles').select('*').limit(1);
      
      if (error) {
        throw error;
      }
      
      console.log('🟢 Supabase 연결 성공!');
      console.log('데이터 샘플:', data);
      return true;
    } catch (error) {
      console.error('🔴 Supabase 연결 실패:', error);
      
      // 테이블 없는 경우 모든 테이블 목록 조회
      if (error.code === '42P01') {
        console.log('\n테이블이 존재하지 않습니다. 현재 데이터베이스 테이블 목록을 조회합니다...');
        try {
          const { data, error: tablesError } = await supabase.rpc('get_tables');
          if (tablesError) {
            console.error('테이블 목록 조회 실패:', tablesError);
          } else {
            console.log('데이터베이스 테이블 목록:', data || '테이블 없음');
          }
        } catch (e) {
          console.log('테이블 목록 조회 중 오류:', e);
        }
      }
      
      return false;
    }
  }

  // 실행
  testConnection()
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('예상치 못한 오류:', error);
      process.exit(1);
    });
} catch (e) {
  console.error('Supabase 클라이언트 생성 중 오류 발생:', e);
  process.exit(1);
} 