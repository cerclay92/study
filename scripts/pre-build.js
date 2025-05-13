const fs = require('fs');
const path = require('path');

// 환경 정보 출력
console.log('==========================================');
console.log('배포 환경 정보:');
console.log('Node.js 버전:', process.version);
console.log('플랫폼:', process.platform);
console.log('==========================================');

// 파일 경로 설정
const componentsDir = path.join(__dirname, '..', 'src', 'components');
const articleCardPath = path.join(componentsDir, 'ArticleCard.tsx');

// ArticleCard.tsx 파일 내용
const articleCardContent = `"use client";

// BlogArticleCard 컴포넌트 임포트
const BlogArticleCard = require('./BlogArticleCard').BlogArticleCard;

// 호환성을 위한 래퍼 컴포넌트
export const ArticleCard = BlogArticleCard;
`;

// components 디렉토리 확인 및 생성
if (!fs.existsSync(componentsDir)) {
  try {
    fs.mkdirSync(componentsDir, { recursive: true });
    console.log('components 디렉토리 생성 완료');
  } catch (error) {
    console.error('components 디렉토리 생성 실패:', error);
  }
}

// ArticleCard.tsx 파일 생성/업데이트
try {
  fs.writeFileSync(articleCardPath, articleCardContent);
  console.log('ArticleCard.tsx 파일 생성/업데이트 완료');
} catch (error) {
  console.error('ArticleCard.tsx 파일 생성/업데이트 실패:', error);
  process.exit(1);
}

console.log('빌드 전 처리 완료'); 