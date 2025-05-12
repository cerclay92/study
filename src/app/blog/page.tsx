import { Metadata } from "next";
import ClientBlogPage from "@/features/blog/components/ClientBlogPage";

export const metadata: Metadata = {
  title: "블로그 - 서재, 사람을 잇다",
  description: "서재, 사람을 잇다의 블로그 페이지입니다.",
};

export default function BlogPage() {
  return <ClientBlogPage />;
} 