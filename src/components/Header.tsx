"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, BookOpen } from "lucide-react";
import { SERVICE_NAME, CATEGORIES } from "@/constants/theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white dark:bg-background/95 backdrop-blur-md border-b border-gray-200 py-3 shadow-sm"
          : "bg-transparent py-4"
      )}
    >
      <div className="container flex items-center justify-between">
        {/* 로고 */}
        <Link 
          href="/" 
          className="flex items-center space-x-2 font-bold group"
        >
          <BookOpen className="w-6 h-6 text-primary transition-colors duration-200" />
          <span className="text-2xl font-extrabold text-primary tracking-wide">{SERVICE_NAME}</span>
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav className="hidden md:flex items-center space-x-8">
          {CATEGORIES.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className={cn(
                "text-sm font-medium transition-colors relative group",
                pathname === `/category/${category.slug}` ? "text-primary" : "text-muted-foreground"
              )}
            >
              {category.name}
              <span className={cn(
                "absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300",
                pathname === `/category/${category.slug}` ? "w-full" : "group-hover:w-full"
              )}></span>
            </Link>
          ))}
          <Link href="/about" className={cn(
            "text-sm font-medium transition-colors relative group",
            pathname === "/about" ? "text-primary" : "text-muted-foreground"
          )}>
            소개
            <span className={cn(
                "absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300",
                pathname === "/about" ? "w-full" : "group-hover:w-full"
              )}></span>
          </Link>
        </nav>

        {/* 구독 버튼 */}
        <div className="hidden md:block">
          <Button asChild size="sm" className="rounded-sm bg-primary hover:bg-primary/90 px-6 font-medium shadow-sm">
            <Link href="/subscribe">구독하기</Link>
          </Button>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="메뉴 열기"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-background/95 backdrop-blur-md border-b shadow-md py-4 animate-in slide-in-from-top duration-300">
          <nav className="container flex flex-col space-y-3">
            {CATEGORIES.map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className={cn(
                  "text-sm font-medium transition-colors py-2 pl-3 border-l-2",
                  pathname === `/category/${category.slug}` 
                    ? "text-primary border-primary" 
                    : "text-muted-foreground border-transparent hover:text-primary hover:border-primary/50"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link 
              href="/about" 
              className={cn(
                "text-sm font-medium transition-colors py-2 pl-3 border-l-2",
                pathname === "/about" 
                  ? "text-primary border-primary" 
                  : "text-muted-foreground border-transparent hover:text-primary hover:border-primary/50"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              소개
            </Link>
            <Button asChild size="sm" className="rounded-sm w-full mt-2 bg-primary hover:bg-primary/90 font-medium">
              <Link href="/subscribe" onClick={() => setIsMenuOpen(false)}>구독하기</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
} 