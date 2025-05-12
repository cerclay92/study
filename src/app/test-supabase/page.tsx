"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>("대기 중...");

  const testConnection = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("test").select("*");

      if (error) {
        throw error;
      }

      setStatus(`연결 성공! 데이터: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error("Supabase 연결 오류:", error);
      if (error instanceof Error) {
        setStatus(`연결 실패: ${error.message}`);
      } else {
        setStatus("연결 실패: 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">Supabase 연결 테스트</h1>
      <Button onClick={testConnection}>테스트 실행</Button>
      <p className="mt-4">{status}</p>
    </div>
  );
} 