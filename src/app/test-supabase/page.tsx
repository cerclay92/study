"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestSupabasePage() {
  const [status, setStatus] = useState("확인 중...");
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // 환경 변수 확인
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "없음",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "설정됨" : "없음",
    });
    
    // Supabase 연결 테스트
    const testConnection = async () => {
      try {
        console.log("Supabase 클라이언트 생성 시도...");
        const supabase = createClient();
        console.log("Supabase 클라이언트 생성 완료");
        
        console.log("카테고리 쿼리 시도...");
        const { data, error } = await supabase.from("categories").select("*").limit(5);
        
        if (error) throw error;
        console.log("카테고리 쿼리 완료:", data);
        setStatus(`연결 성공: ${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        console.error("Supabase 연결 오류:", error);
        setStatus(`연결 실패: ${error.message}`);
      }
    };
    
    testConnection();
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase 연결 테스트</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">환경 변수</h2>
        <div className="p-4 bg-gray-100 rounded-md">
          <pre>{JSON.stringify(envVars, null, 2)}</pre>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">연결 상태</h2>
        <div className="p-4 bg-gray-100 rounded-md">
          <pre>{status}</pre>
        </div>
      </div>
    </div>
  );
} 