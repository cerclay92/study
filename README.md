이 프로젝트는 [`EasyNext`](https://github.com/easynext/easynext)를 사용해 생성된 [Next.js](https://nextjs.org) 프로젝트입니다.

# 블로그 시스템

티스토리 스타일의 블로그 기능이 구현된 웹 애플리케이션입니다.

## 기술 스택

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Supabase (백엔드 및 데이터베이스)
- TipTap Editor
- Zustand
- React Hook Form
- Zod

## 주요 기능

### 블로그 기능
- 게시글 작성, 수정, 삭제
- 리치텍스트 에디터 (TipTap 기반)
- 카테고리 및 태그 기능
- 이미지 업로드 기능
- 댓글 시스템
- 조회수 통계

### 어드민 기능
- 대시보드 (통계, 차트)
- 게시글 관리 (발행, 비공개, 삭제)
- 댓글 관리 (승인, 삭제)
- 임시저장 기능

## 데이터베이스 구조

Supabase에 다음과 같은 테이블이 생성됩니다:

- users: 사용자 정보
- admins: 관리자 정보
- articles: 게시글
- categories: 카테고리
- tags: 태그
- article_tags: 게시글-태그 연결
- comments: 댓글
- drafts: 임시저장
- likes: 좋아요
- blog_settings: 블로그 설정
- uploads: 파일 업로드
- visit_statistics: 방문자 통계

## 설치 및 실행 방법

1. 의존성 설치
```bash
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

3. Supabase 로컬 개발 환경 설정 (선택사항)
```bash
npx supabase start
```

## Supabase 마이그레이션

`/supabase/migrations` 디렉토리에 마이그레이션 파일이 포함되어 있습니다:

1. `00001_create_schema.sql`: 기본 테이블 생성
2. `00002_blog_features.sql`: 블로그 관련 테이블 생성
3. `00003_add_functions.sql`: RPC 함수 정의

## API 구조

`/src/features/blog/api.ts` 파일에 블로그 관련 API 함수가 정의되어 있습니다.

## 라우팅 구조

- `/blog`: 블로그 메인 페이지
- `/article/[slug]`: 게시글 상세 페이지
- `/admin/blog`: 블로그 관리 페이지
- `/admin/blog/write`: 게시글 작성 페이지
- `/admin/blog/edit/[id]`: 게시글 수정 페이지
- `/admin/dashboard`: 관리자 대시보드

## 설정 방법

1. Supabase 프로젝트 생성
2. `.env.local` 파일 설정
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
3. 마이그레이션 실행
```bash
npx supabase db push
```

## Getting Started

개발 서버를 실행합니다.<br/>
환경에 따른 명령어를 사용해주세요.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인할 수 있습니다.

`app/page.tsx` 파일을 수정하여 페이지를 편집할 수 있습니다. 파일을 수정하면 자동으로 페이지가 업데이트됩니다.

## 기본 포함 라이브러리

- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)
- [Shadcn UI](https://ui.shadcn.com)
- [Lucide Icon](https://lucide.dev)
- [date-fns](https://date-fns.org)
- [react-use](https://github.com/streamich/react-use)
- [es-toolkit](https://github.com/toss/es-toolkit)
- [Zod](https://zod.dev)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com)
- [TS Pattern](https://github.com/gvergnaud/ts-pattern)

## 사용 가능한 명령어

한글버전 사용

```sh
easynext lang ko
```

최신버전으로 업데이트

```sh
npm i -g @easynext/cli@latest
# or
yarn add -g @easynext/cli@latest
# or
pnpm add -g @easynext/cli@latest
```

Supabase 설정

```sh
easynext supabase
```

Next-Auth 설정

```sh
easynext auth

# ID,PW 로그인
easynext auth idpw
# 카카오 로그인
easynext auth kakao
```

유용한 서비스 연동

```sh
# Google Analytics
easynext gtag

# Microsoft Clarity
easynext clarity

# ChannelIO
easynext channelio

# Sentry
easynext sentry

# Google Adsense
easynext adsense
```
#   s t u d y  
 #   s t u d y  
 