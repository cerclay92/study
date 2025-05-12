"use client";

import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/constants/theme";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

// 구독 신청 폼 타입
type SubscriptionFormValues = {
  email: string;
  fullName: string;
  plan: "monthly" | "yearly";
};

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<SubscriptionFormValues>({
    defaultValues: {
      email: "",
      fullName: "",
      plan: "monthly",
    },
  });
  
  const onSubmit = async (data: SubscriptionFormValues) => {
    setIsSubmitting(true);
    
    // 실제 구현에서는 API 호출로 대체
    // 예: await fetch("/api/subscribe", { method: "POST", body: JSON.stringify(data) });
    
    // 성공 시뮬레이션
    setTimeout(() => {
      toast({
        title: "구독 신청이 완료되었습니다!",
        description: "입력하신 이메일로 결제 정보를 보내드렸습니다.",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  // 구독 혜택 목록
  const benefits = [
    "모든 프리미엄 콘텐츠 무제한 이용",
    "매월 뉴스레터 이메일 수신",
    "이전 아카이브 전체 열람 가능",
    "커뮤니티 특별 이벤트 초대",
    "신규 콘텐츠 우선 알림",
  ];

  return (
    <PageLayout>
      <div className="container py-10">
        <header className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">구독하기</h1>
          <p className="text-lg text-muted-foreground">
            매월 엄선된 콘텐츠를 받아보세요.
            <br />
            언제든지 구독을 취소할 수 있습니다.
          </p>
        </header>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* 구독 정보 */}
            <div>
              <h2 className="text-2xl font-bold mb-6">구독 혜택</h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={20} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-bold mb-2">구독 시 참고사항</h3>
                <p className="text-sm text-muted-foreground">
                  구독은 선택한 주기에 따라 자동으로 갱신됩니다. 언제든지 계정 페이지에서 구독을 관리하거나 취소할 수 있습니다. 구독 취소 후에도 결제 주기가 끝날 때까지 콘텐츠를 이용할 수 있습니다.
                </p>
              </div>
            </div>
            
            {/* 구독 플랜 선택 및 신청 폼 */}
            <div>
              <h2 className="text-2xl font-bold mb-6">플랜 선택</h2>
              
              <RadioGroup
                value={selectedPlan}
                onValueChange={(value) => setSelectedPlan(value as "monthly" | "yearly")}
                className="space-y-4 mb-8"
              >
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan === "monthly" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPlan("monthly")}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
                    <div>
                      <Label htmlFor="monthly" className="text-lg font-medium cursor-pointer">
                        {SUBSCRIPTION_PLANS.monthly.name}
                      </Label>
                      <p className="text-2xl font-bold my-1">
                        {SUBSCRIPTION_PLANS.monthly.price}원<span className="text-sm font-normal text-muted-foreground"> / 월</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {SUBSCRIPTION_PLANS.monthly.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan === "yearly" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPlan("yearly")}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="yearly" id="yearly" className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="yearly" className="text-lg font-medium cursor-pointer">
                          {SUBSCRIPTION_PLANS.yearly.name}
                        </Label>
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">17% 할인</span>
                      </div>
                      <p className="text-2xl font-bold my-1">
                        {SUBSCRIPTION_PLANS.yearly.price}원<span className="text-sm font-normal text-muted-foreground"> / 년</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {SUBSCRIPTION_PLANS.yearly.description}
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">이름</Label>
                  <Input
                    id="fullName"
                    placeholder="홍길동"
                    {...register("fullName", { required: "이름을 입력해주세요" })}
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...register("email", { 
                      required: "이메일을 입력해주세요",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "유효한 이메일 주소를 입력해주세요"
                      }
                    })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                <input type="hidden" {...register("plan")} value={selectedPlan} />
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "처리 중..." : `${selectedPlan === "monthly" ? "월간" : "연간"} 구독 신청하기`}
                </Button>
              </form>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                구독 신청 시 <a href="/terms" className="underline">이용약관</a>과 <a href="/privacy" className="underline">개인정보처리방침</a>에 동의하게 됩니다.
              </p>
            </div>
          </div>
          
          {/* FAQ 섹션 */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center">자주 묻는 질문</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">구독은 언제든지 취소할 수 있나요?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    네, 언제든지 구독을 취소할 수 있습니다. 취소 후에도 결제 주기가 끝날 때까지는 콘텐츠를 이용하실 수 있습니다.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">결제는 어떤 방식으로 이루어지나요?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    카카오페이, 토스페이 등 다양한 간편결제 수단을 지원합니다. 구독 신청 후 결제 페이지로 이동합니다.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">구독자에게 제공되는 혜택은 무엇인가요?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    모든 프리미엄 콘텐츠에 대한 무제한 접근, 월간 뉴스레터, 아카이브 열람, 커뮤니티 이벤트 초대 등의 혜택이 있습니다.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">뉴스레터는 어떤 내용을 담고 있나요?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    매월 주요 콘텐츠 요약, 에디터의 추천 도서, 독점 인터뷰 등 다양한 콘텐츠를 제공합니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 