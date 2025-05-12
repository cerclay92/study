// 서비스 이름
export const SERVICE_NAME = "서재, 사람을 잇다";

// 메인 컬러: 연한 초록색
export const MAIN_COLOR = {
  primary: "rgb(170, 219, 170)", // 연한 초록색
  primaryLight: "rgb(205, 234, 205)",
  primaryDark: "rgb(135, 195, 135)",
  secondary: "rgb(244, 241, 238)", // 베이지 톤
  accent: "rgb(65, 105, 65)", // 진한 초록색
};

// 컬러 클래스 이름
export const COLOR_CLASS = {
  primary: "bg-primary text-primary-foreground",
  primaryLight: "bg-primary/20",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

// 가격 정보
export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: "월간 구독",
    price: 1000,
    description: "매월 정기결제됩니다.",
  },
  yearly: {
    name: "연간 구독",
    price: 10000,
    description: "매년 정기결제됩니다.",
  },
};

// 카테고리 정보
export const CATEGORIES = [
  { id: 1, name: "에세이", slug: "essay" },
  { id: 2, name: "인문학", slug: "humanities" },
  { id: 3, name: "문화", slug: "culture" },
  { id: 4, name: "상담 사례", slug: "counseling" },
  { id: 5, name: "인터뷰", slug: "interview" },
]; 