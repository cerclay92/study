import { createClient } from '@supabase/supabase-js';
import type { Database } from "./types";

// 환경 변수가 문제가 있을 경우를 대비한 하드코딩된 백업 값
const BACKUP_SUPABASE_URL = "https://fntiuopyonutxkeeipsc.supabase.co";
const BACKUP_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGl1b3B5b251dHhrZWVpcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMTE1NTgsImV4cCI6MjA2MjU4NzU1OH0.J_gFu3MByiStp6IO7EmT4Lplp-_QYY0lLkX8h3L6S5o";

export const createServerClient = () => {
  try {
    // 환경 변수 확인 및 백업 값 사용
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || BACKUP_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || BACKUP_SUPABASE_ANON_KEY;

    // 가장 기본적인 방식으로 Supabase 클라이언트 생성
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    
    return supabase;
  } catch (error) {
    console.error("Supabase 클라이언트 생성 중 오류 발생:", error);
    throw new Error("Supabase 클라이언트를 초기화할 수 없습니다.");
  }
}; 