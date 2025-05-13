const fs = require('fs');
const path = require('path');

// 환경 정보 출력
console.log('==========================================');
console.log('Node.js 버전:', process.version);
console.log('플랫폼:', process.platform);
console.log('현재 작업 디렉토리:', process.cwd());
console.log('==========================================');

// 경로 정의
const articleCardPath = path.join(__dirname, '..', 'src', 'components', 'ArticleCard.tsx');
const fixedArticleCardContent = `"use client";

import { BlogArticleCard } from "./BlogArticleCard";

// 새로운 컴포넌트로 마이그레이션
// 이전 버전과의 호환성을 위해 새 컴포넌트로 리다이렉트
export const ArticleCard = BlogArticleCard;
`;

console.log('빌드 전 파일 정리 시작...');
console.log('ArticleCard 파일 경로:', articleCardPath);

// ArticleCard.tsx 파일 처리
try {
  // 파일이 있는 경우 내용 확인
  if (fs.existsSync(articleCardPath)) {
    console.log('ArticleCard.tsx 파일이 존재합니다.');
    const content = fs.readFileSync(articleCardPath, 'utf8');
    console.log('ArticleCard.tsx 파일 크기:', content.length, '바이트');
    
    // 파일 내용 앞부분 출력 (디버깅용)
    console.log('파일 내용 일부:', content.substring(0, 100).replace(/\n/g, '\\n'));
    
    // 병합 충돌 마커가 있는지 확인
    if (content.includes('<<<<<<< HEAD') || content.includes('=======') || content.includes('>>>>>>>')) {
      console.log('ArticleCard.tsx 파일에서 병합 충돌 마커 발견. 파일 재생성 중...');
      fs.writeFileSync(articleCardPath, fixedArticleCardContent);
      console.log('ArticleCard.tsx 파일 재생성 완료.');
      
      // 제대로 적용되었는지 확인
      const newContent = fs.readFileSync(articleCardPath, 'utf8');
      console.log('새 파일 내용 일부:', newContent.substring(0, 100).replace(/\n/g, '\\n'));
    } else {
      console.log('ArticleCard.tsx 파일은 정상적입니다.');
    }
  } else {
    console.log('ArticleCard.tsx 파일이 없습니다. 새로 생성합니다.');
    // 디렉토리가 없을 경우 생성
    const dir = path.dirname(articleCardPath);
    if (!fs.existsSync(dir)) {
      console.log('components 디렉토리가 없습니다. 생성 중...');
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(articleCardPath, fixedArticleCardContent);
    console.log('ArticleCard.tsx 파일 생성 완료.');
    
    // 제대로 생성되었는지 확인
    if (fs.existsSync(articleCardPath)) {
      console.log('ArticleCard.tsx 파일이 성공적으로 생성되었습니다.');
    } else {
      console.log('오류: ArticleCard.tsx 파일 생성 후 존재하지 않습니다.');
    }
  }
  
  // BlogArticleCard.tsx 파일 존재 확인
  const blogArticleCardPath = path.join(__dirname, '..', 'src', 'components', 'BlogArticleCard.tsx');
  if (fs.existsSync(blogArticleCardPath)) {
    console.log('BlogArticleCard.tsx 파일이 존재합니다.');
  } else {
    console.error('오류: BlogArticleCard.tsx 파일이 존재하지 않습니다!');
  }
  
} catch (error) {
  console.error('ArticleCard.tsx 파일 처리 중 오류 발생:', error);
  process.exit(1);
}

console.log('빌드 전 파일 정리 완료!'); 