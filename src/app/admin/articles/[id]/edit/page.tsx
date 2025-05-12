"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ArticleEditRedirectPage({
  params,
}: PageProps) {
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    router.replace(`/admin/blog/edit/${id}`);
  }, [router, id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">리다이렉트 중...</p>
    </div>
  );
} 