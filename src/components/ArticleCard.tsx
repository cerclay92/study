"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type ArticleProps = {
  article: {
    id: number;
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
    slug: string;
  };
};

export function ArticleCard({ article }: ArticleProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article.featured_image || "https://picsum.photos/400/300"}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <CalendarIcon className="w-4 h-4" />
          <time dateTime={article.created_at}>{formatDate(article.created_at)}</time>
        </div>
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/article/${article.slug}`}>{article.title}</Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {article.content}
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-primary">{article.category.name}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{article.author.name}</span>
        </div>
      </CardFooter>
    </Card>
  );
} 