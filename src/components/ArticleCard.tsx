"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ArticleCardProps = {
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

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/blog/${article.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        {article.featured_image && (
          <div className="relative w-full h-48">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{article.category.name}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <time dateTime={article.created_at}>
                {new Date(article.created_at).toLocaleDateString()}
              </time>
            </div>
          </div>
          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {article.content}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            작성자: {article.author.name}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 