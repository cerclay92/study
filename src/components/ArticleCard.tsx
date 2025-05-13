"use client";

// ArticleCard는 BlogArticleCard를 참조하는 간단한 래퍼입니다
import { BlogArticleCard } from "./BlogArticleCard";

// 새 컴포넌트로 마이그레이션하여 호환성 유지
export const ArticleCard = BlogArticleCard;
