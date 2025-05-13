
// Supabase 오류 방지를 위한 임시 라우트 핸들러 (draft 전용)
// 배포 환경에서 실제 데이터를 반환하지 않는 더미 구현입니다.

// 환경 변수 백업 설정 (빌드 시 오류 방지)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fntiuopyonutxkeeipsc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGl1b3B5b251dHhrZWVpcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMTE1NTgsImV4cCI6MjA2MjU4NzU1OH0.J_gFu3MByiStp6IO7EmT4Lplp-_QYY0lLkX8h3L6S5o';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGl1b3B5b251dHhrZWVpcHNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzAxMTU1OCwiZXhwIjoyMDYyNTg3NTU4fQ.dummy-service-role-for-build';

export const dynamic = 'force-dynamic';

// POST 요청 핸들러 (임시저장 생성)
export async function POST() {
  try {
    return Response.json({ 
      id: 123,
      message: 'Temporary draft created for build process'
    });
  } catch (error) {
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PUT 요청 핸들러 (임시저장 업데이트)
export async function PUT() {
  try {
    return Response.json({ 
      success: true,
      message: 'Temporary draft updated for build process'
    });
  } catch (error) {
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE 요청 핸들러 (임시저장 삭제)
export async function DELETE() {
  try {
    return Response.json({
      success: true,
      message: 'Temporary draft deleted for build process'
    });
  } catch (error) {
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
