"use client";

<<<<<<< HEAD
import Link from "next/link";
import Image from "next/image";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type ArticleProps = {
  article: {
    id: number;
=======
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ArticleCardProps = {
  article: {
    id: string;
>>>>>>> e93acc1ca4550f1cf3f40f87f92b385f82480fc0
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
<<<<<<< HEAD
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
=======
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
>>>>>>> e93acc1ca4550f1cf3f40f87f92b385f82480fc0
  );
} 