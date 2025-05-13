"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { SERVICE_NAME } from "@/constants/theme";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 실제 구현에서는 API 호출
    // 예: const response = await fetch("/api/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });

    // 임시로 간단한 로그인 성공 시뮬레이션
    // 실제 구현에서는 이 부분을 API 응답에 따라 처리
    setTimeout(() => {
      if (email === "admin@example.com" && password === "password") {
        // 알림 대신 console.log 사용
        console.log("로그인 성공");
        router.push("/admin");
      } else {
        // 알림 대신 console.error 사용
        console.error("로그인 실패");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <BookOpen className="w-6 h-6" />
              <span>{SERVICE_NAME}</span>
            </div>
          </div>
          <CardTitle className="text-2xl">관리자 로그인</CardTitle>
          <CardDescription>
            관리자 계정으로 로그인하여 콘텐츠를 관리하세요.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
                <Link 
                  href="/admin/forgot-password" 
                  className="text-xs text-primary hover:underline"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              <span>테스트 계정: admin@example.com / password</span>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                홈페이지로 돌아가기
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 