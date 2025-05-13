
// 빌드 오류 방지용 임시 라우트 핸들러
// Supabase 오류 방지를 위한 환경 변수 설정
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fntiuopyonutxkeeipsc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGl1b3B5b251dHhrZWVpcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMTE1NTgsImV4cCI6MjA2MjU4NzU1OH0.J_gFu3MByiStp6IO7EmT4Lplp-_QYY0lLkX8h3L6S5o';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGl1b3B5b251dHhrZWVpcHNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzAxMTU1OCwiZXhwIjoyMDYyNTg3NTU4fQ.dummy-service-role-for-build';

export async function GET() {
  try {
    return Response.json({
      message: 'Temporary route for build process',
      supabase_url: SUPABASE_URL,
      has_key: !!SUPABASE_ANON_KEY,
      has_service_role: !!SUPABASE_SERVICE_ROLE_KEY
    });
  } catch (error) {
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function POST() {
  try {
    return Response.json({
      message: 'Temporary route for build process',
      success: true
    });
  } catch (error) {
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PUT() {
  try {
    return Response.json({
      message: 'Temporary route for build process',
      success: true
    });
  } catch (error) {
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    return Response.json({
      message: 'Temporary route for build process',
      success: true
    });
  } catch (error) {
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
