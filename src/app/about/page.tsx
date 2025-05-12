"use client";

import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { SERVICE_NAME } from "@/constants/theme";

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="container py-10">
        <header className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{SERVICE_NAME} 소개</h1>
          <p className="text-lg text-muted-foreground">
            책과 사람, 그리고 만남을 잇는 온라인 인문학 매거진
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* 서비스 철학 및 소개 */}
          <section className="mb-16">
            <div className="relative aspect-[16/7] rounded-lg overflow-hidden mb-8">
              <Image
                src="https://picsum.photos/id/24/1600/700"
                alt="책을 읽는 모습"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                <h2 className="text-white text-2xl md:text-3xl font-bold">
                  서재의 지속되는 이야기, 그리고 사람을 잇는 공간
                </h2>
              </div>
            </div>

            <div className="prose max-w-none">
              <blockquote>
                “서재의 계속되는 이야기 – 프롤로그 호를 시작하며”
              </blockquote>
              <p>
                저는 책을 읽고 연구하며, 그 배움을 사람들과 함께 나누는 것을 좋아합니다. 이것이 제 소명이라고 믿고 있습니다. 하지만 제가 접한 소중한 배움들은 여전히 많은 이들에게 쉽게 다가가기 어려운 길이었습니다.
              </p>
              <p>
                어떻게 하면 더 쉽고 편안하게 나눌 수 있을까 고민하며 온라인 소식지 '서재, 사람을 잇다'를 시작하게 되었습니다. 비록 오프라인 공간 서재는 잠시 쉬어가지만, 서재의 인문학 강좌는 12년째 계속해서 지금도 이어지고 있습니다.
              </p>
              <p>
                서재의 이름으로 여전히 많은 분들과 소중한 만남을 이어가고 있기에, '서재, 사람을 잇다'를 통해 더 많은 분들과 함께하며 소통할 수 있기를 기대합니다.
              </p>
              <p className="text-right">- 서재지기</p>
            </div>
          </section>

          {/* 핵심 가치 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">핵심 가치</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-secondary/30 rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">깊이 있는 콘텐츠</h3>
                <p className="text-muted-foreground">
                  표면적인 정보가 아닌, 삶에 대한 깊은 통찰과 의미를 담은 콘텐츠를 제공합니다.
                </p>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">다양성과 포용</h3>
                <p className="text-muted-foreground">
                  다양한 관점과 경험을 존중하며, 모든 독자들이 공감할 수 있는 콘텐츠를 지향합니다.
                </p>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">진정성과 공감</h3>
                <p className="text-muted-foreground">
                  삶의 다양한 순간을 진솔하게 담아내며, 독자들이 공감하고 위로받을 수 있는 콘텐츠를 추구합니다.
                </p>
              </div>
            </div>
          </section>

          {/* 운영진 소개 */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">운영진 소개</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="https://i.pravatar.cc/150?u=ohjisub"
                    alt="오지섭 교수"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">오지섭</h3>
                  <p className="text-sm text-primary mb-2">서강대학교 종교학과 교수</p>
                  <p className="text-muted-foreground text-sm">
                    인문학 강좌와 북카페 '서재'의 운영자. 책과 인문학을 통해 사람과 사람을 잇는 소통의 장을 만들어가고 있습니다.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="https://i.pravatar.cc/150?u=parkjaesin"
                    alt="박재신"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">박재신</h3>
                  <p className="text-sm text-primary mb-2">북카페 '서재' 공동운영자</p>
                  <p className="text-muted-foreground text-sm">
                    오지섭 교수와 함께 북카페 '서재'를 운영하며, 인문학적 만남과 따뜻한 소통을 이어가고 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-primary/10 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">함께 성장하는 여정에 동참하세요</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              <strong>{SERVICE_NAME}</strong>와 함께 더 깊고 의미 있는 콘텐츠를 경험해보세요.
              매월 1,000원으로 모든 프리미엄 콘텐츠를 무제한으로 이용할 수 있습니다.
            </p>
            <Button asChild size="lg">
              <Link href="/subscribe">지금 구독하기</Link>
            </Button>
          </section>
        </div>
      </div>
    </PageLayout>
  );
} 