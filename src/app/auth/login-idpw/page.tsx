"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { SERVICE_NAME } from "@/constants/theme";

// Next.js 15에서는 useSearchParams()가 Suspense 경계 내부에서 사용되어야 함
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  // 로그인 폼 스키마
  const formSchema = z.object({
    email: z.string().email({
      message: "유효한 이메일을 입력해주세요.",
    }),
    password: z.string().min(8, {
      message: "비밀번호는 8자 이상이어야 합니다.",
    }),
  });

  // 폼 상태 관리
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  // 폼 제출 처리
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      });

      if (!result?.error) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        console.error("로그인 실패:", result.error);
        form.setError("root", {
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        });
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* 에러 메시지 표시 */}
          {(error || form.formState.errors.root) && (
            <div className="bg-destructive/15 text-destructive text-center py-2 px-3 rounded-md text-sm">
              {error === "CredentialsSignin"
                ? "이메일 또는 비밀번호가 올바르지 않습니다."
                : form.formState.errors.root?.message || "로그인 중 오류가 발생했습니다."}
            </div>
          )}

          {/* 이메일 필드 */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 비밀번호 필드 */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>비밀번호</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    비밀번호 찾기
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "로그인 중..." : "로그인"}
        </Button>

        <div className="mt-4 text-center text-sm">
          계정이 없으신가요?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            회원가입
          </Link>
        </div>
      </form>
    </Form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold">
              <BookOpen className="w-6 h-6" />
              <span>{SERVICE_NAME}</span>
            </Link>
          </div>
          <CardTitle className="text-2xl">이메일로 로그인</CardTitle>
          <CardDescription>
            이메일과 비밀번호를 입력하여 로그인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>로딩 중...</div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
