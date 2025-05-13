const fs = require('fs');
const path = require('path');

// 환경 정보 출력
console.log('==========================================');
console.log('배포 환경 정보:');
console.log('Node.js 버전:', process.version);
console.log('플랫폼:', process.platform);
console.log('==========================================');

// 경로 정의
const componentsDir = path.join(__dirname, '..', 'src', 'components');
const articleCardPath = path.join(componentsDir, 'ArticleCard.tsx');
const blogArticleCardPath = path.join(componentsDir, 'BlogArticleCard.tsx');

// ArticleCard 컴포넌트 내용
const fixedArticleCardContent = `"use client";

import { BlogArticleCard } from "./BlogArticleCard";

// 새 컴포넌트로 마이그레이션하여 호환성 유지
export const ArticleCard = BlogArticleCard;
`;

// components 디렉토리 존재 확인 및 생성
if (!fs.existsSync(componentsDir)) {
  console.log('components 디렉토리 생성 중...');
  fs.mkdirSync(componentsDir, { recursive: true });
}

// BlogArticleCard.tsx 파일 확인 (이 파일이 반드시 있어야 함)
if (!fs.existsSync(blogArticleCardPath)) {
  console.error('오류: BlogArticleCard.tsx 파일이 존재하지 않습니다!');
  
  // BlogArticleCard.tsx 내용
  const blogArticleCardContent = `"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type ArticleProps = {
  article: {
    id: string;
    title: string;
    content: string;
    featured_image: string | null;
    created_at: string;
    category: {
      id: string;
      name: string;
    };
    author: {
      name: string;
    };
  };
};

export function BlogArticleCard({ article }: ArticleProps) {
  return (
    <Link href={\`/blog/\${article.id}\`} passHref>
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative w-full h-48 overflow-hidden">
          {article.featured_image ? (
            <Image
              src={article.featured_image}
              alt={article.title}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <Image
              src="https://picsum.photos/800/600"
              alt="기본 이미지"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          )}
        </div>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              {article.category?.name || "미분류"}
            </span>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{format(new Date(article.created_at), "yyyy.MM.dd")}</span>
            </div>
          </div>
          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-3">
            {article.content.replace(/<[^>]*>/g, "")}
          </CardDescription>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            {article.author?.name || "익명"}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}`;

  // BlogArticleCard.tsx 파일 생성
  fs.writeFileSync(blogArticleCardPath, blogArticleCardContent);
  console.log('BlogArticleCard.tsx 파일을 새로 생성했습니다.');
}

// ArticleCard.tsx 파일 처리 (항상 새로 생성)
try {
  console.log('ArticleCard.tsx 파일 생성/업데이트 중...');
  fs.writeFileSync(articleCardPath, fixedArticleCardContent);
  console.log('ArticleCard.tsx 파일 처리 완료!');
} catch (error) {
  console.error('ArticleCard.tsx 파일 처리 중 오류 발생:', error);
  process.exit(1);
}

console.log('빌드 전 파일 정리 완료!'); 