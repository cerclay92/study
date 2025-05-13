"use client";

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
    <Link href={`/blog/${article.id}`} passHref>
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
} 