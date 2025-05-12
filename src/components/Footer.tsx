"use client";

import Link from "next/link";
import { SERVICE_NAME, CATEGORIES } from "@/constants/theme";
import { Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 실제 구현에서는 이 부분을 API 호출로 대체
    setTimeout(() => {
      toast({
        title: "구독 신청 완료",
        description: `${email} 주소로 구독 신청이 완료되었습니다.`,
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <footer className="border-t pt-12 pb-8 bg-white">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-8">
          {/* 로고 및 정보 */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-primary mb-4">{SERVICE_NAME}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              사람과 사람을 잇는 온라인 매거진 서비스
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 text-gray-600 hover:text-primary transition-colors p-2 rounded-sm"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 text-gray-600 hover:text-primary transition-colors p-2 rounded-sm"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 text-gray-600 hover:text-primary transition-colors p-2 rounded-sm"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="mailto:contact@magazine.kr"
                className="bg-gray-100 text-gray-600 hover:text-primary transition-colors p-2 rounded-sm"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* 카테고리 */}
          <div className="md:col-span-1">
            <h3 className="text-base font-bold mb-4 text-foreground border-b border-gray-200 pb-2">
              카테고리
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 링크 */}
          <div className="md:col-span-1">
            <h3 className="text-base font-bold mb-4 text-foreground border-b border-gray-200 pb-2">
              정보
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link
                  href="/subscribe"
                  className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  구독하기
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          {/* 뉴스레터 구독 */}
          <div className="md:col-span-1">
            <h3 className="text-base font-bold mb-4 text-foreground border-b border-gray-200 pb-2">
              뉴스레터 구독
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              매월 새로운 콘텐츠 소식을 이메일로 받아보세요.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <Input
                type="email"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm bg-white border-gray-300 focus:border-primary focus:ring-primary rounded-sm"
              />
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 rounded-sm font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "처리 중..." : "구독하기"}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 text-center text-xs text-gray-500">
          <p>© {currentYear} {SERVICE_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 