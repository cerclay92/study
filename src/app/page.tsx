"use client";

import React, { ReactElement } from "react";
import Link from "next/link";
import { FileText, BookOpen, Palette, Lightbulb, Newspaper, Shapes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/constants/theme";
import ClientHome from "@/features/home/components/ClientHome";

// 카테고리별 아이콘 매핑
const categoryIcons: Record<string, ReactElement> = {
  "에세이": <FileText className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 에세이
  "인문학": <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 인문학
  "문화": <Palette className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 문화
  "과학": <Lightbulb className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 과학
  "시사": <Newspaper className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 시사
  "기타": <Shapes className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />, // 기타
};

export default function HomePage() {
  return <ClientHome categoryIcons={categoryIcons} />;
}
