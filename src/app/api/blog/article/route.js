
// 빌드 오류 방지용 임시 라우트 핸들러
export async function GET() {
  return Response.json({ message: 'Temporary route for build process' });
}

export async function POST() {
  return Response.json({ message: 'Temporary route for build process' });
}
