// Supabase 테이블 목록 확인 스크립트
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 환경 변수에서 Supabase 정보 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 올바르게 설정되지 않았습니다.');
  process.exit(1);
}

async function testSpecificTables() {
  // Supabase 클라이언트 생성
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // 테스트할 테이블 목록
  const tablesToTest = [
    'categories',
    'articles',
    'tags',
    'comments',
    'users',
    'admins',
    'blog_settings',
    'drafts',
    'visit_statistics'
  ];
  
  console.log('====== 테이블 존재 여부 확인 ======');
  
  // 각 테이블 존재 여부 확인
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: 존재하지 않음 (${error.message})`);
      } else {
        console.log(`✅ ${table}: 존재함 (rows: ${data})`);
      }
    } catch (error) {
      console.log(`❌ ${table}: 오류 발생 (${error.message})`);
    }
  }
  
  console.log('================================');
  
  // 결론 및 다음 단계 안내
  console.log('\n[다음 단계]');
  console.log('1. Supabase 대시보드의 SQL 에디터에서 마이그레이션 파일을 실행하세요.');
  console.log('2. 마이그레이션 파일은 다음과 같습니다:');
  console.log('   - /supabase/migrations/00001_create_schema.sql');
  console.log('   - /supabase/migrations/00002_blog_features.sql');
  console.log('   - /supabase/migrations/00003_add_functions.sql');
  console.log('3. 또는 Supabase CLI를 사용하여 마이그레이션을 적용할 수 있습니다:');
  console.log('   npx supabase db push');
}

// 실행
testSpecificTables().catch(console.error); 