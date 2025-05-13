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
const blogArticleCardPath = path.join(componentsDir, 'BlogArticleCard.tsx');
const supabaseMigrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// ArticleCard.tsx 파일 내용
const articleCardContent = `"use client";

// ArticleCard는 BlogArticleCard를 참조하는 간단한 래퍼입니다
import { BlogArticleCard } from "./BlogArticleCard";

// 새 컴포넌트로 마이그레이션하여 호환성 유지
export const ArticleCard = BlogArticleCard;
`;

// 기본 BlogArticleCard.tsx 내용 (BlogArticleCard.tsx가 없을 경우를 대비)
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

// Supabase 마이그레이션 처리 함수
function handleSupabaseMigrations() {
  console.log('Supabase 마이그레이션 처리 시작...');
  
  if (!fs.existsSync(supabaseMigrationsDir)) {
    try {
      fs.mkdirSync(supabaseMigrationsDir, { recursive: true });
      console.log('Supabase 마이그레이션 디렉토리 생성 완료');
    } catch (error) {
      console.error('Supabase 마이그레이션 디렉토리 생성 실패:', error);
      return; // 오류가 있어도 빌드는 계속 진행
    }
  }
  
  // 중복 마이그레이션 파일 확인 및 정리
  try {
    const migrationFiles = fs.readdirSync(supabaseMigrationsDir);
    const uniqueMigrations = new Map();
    
    // 파일명에서 버전 번호와 이름 추출하는 정규식
    const migrationPattern = /^(\d+)_(.+)\.sql$/;
    
    // 모든 마이그레이션 파일을 순회하며 중복 확인
    migrationFiles.forEach(filename => {
      const match = filename.match(migrationPattern);
      if (match) {
        const [_, version, name] = match;
        
        // 파일명에 버전 번호가 없는 경우 (예: fix_post_dates.sql)
        if (!version) return;
        
        // 이름이 같은 마이그레이션이 있는지 확인하고 최신 버전 유지
        if (!uniqueMigrations.has(name) || 
            parseInt(version) > parseInt(uniqueMigrations.get(name).version)) {
          uniqueMigrations.set(name, { version, filename });
        }
      }
    });
    
    // 중복 파일 삭제
    migrationFiles.forEach(filename => {
      const match = filename.match(migrationPattern);
      if (match) {
        const [_, version, name] = match;
        
        // 최신 버전이 아닌 파일은 삭제
        if (uniqueMigrations.has(name) && 
            uniqueMigrations.get(name).filename !== filename) {
          const filepath = path.join(supabaseMigrationsDir, filename);
          fs.unlinkSync(filepath);
          console.log(`중복 마이그레이션 파일 삭제: ${filename}`);
        }
      }
    });
    
    console.log('Supabase 마이그레이션 처리 완료');
  } catch (error) {
    console.error('Supabase 마이그레이션 처리 중 오류:', error);
  }
}

// components 디렉토리 확인 및 생성
if (!fs.existsSync(componentsDir)) {
  try {
    fs.mkdirSync(componentsDir, { recursive: true });
    console.log('components 디렉토리 생성 완료');
  } catch (error) {
    console.error('components 디렉토리 생성 실패:', error);
    process.exit(1);
  }
}

// BlogArticleCard.tsx 파일 확인 및 생성 (없는 경우)
if (!fs.existsSync(blogArticleCardPath)) {
  try {
    fs.writeFileSync(blogArticleCardPath, blogArticleCardContent);
    console.log('BlogArticleCard.tsx 파일 생성 완료');
  } catch (error) {
    console.error('BlogArticleCard.tsx 파일 생성 실패:', error);
    process.exit(1);
  }
}

// ArticleCard.tsx 파일 생성/업데이트 (항상 새로 생성)
try {
  // 먼저 기존 파일 삭제 (병합 충돌 마커가 있을 수 있음)
  if (fs.existsSync(articleCardPath)) {
    fs.unlinkSync(articleCardPath);
    console.log('기존 ArticleCard.tsx 파일 삭제 완료');
  }
  
  // 새 파일 생성
  fs.writeFileSync(articleCardPath, articleCardContent);
  console.log('ArticleCard.tsx 파일 생성 완료');
} catch (error) {
  console.error('ArticleCard.tsx 파일 처리 실패:', error);
  process.exit(1);
}

// Supabase 마이그레이션 처리 실행
handleSupabaseMigrations();

console.log('빌드 전 처리 완료'); 