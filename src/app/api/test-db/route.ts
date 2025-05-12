import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();
    const results = { categories: null, articles: null, errors: [] };
    
    // 카테고리 데이터 가져오기
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
      
      results.categories = categories;
      
      if (categoriesError) {
        results.errors.push({
          source: '카테고리 조회',
          error: categoriesError,
          message: categoriesError.message
        });
      }
    } catch (e) {
      results.errors.push({
        source: '카테고리 조회 예외',
        error: e
      });
    }
    
    // 게시글 데이터 가져오기
    try {
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('*');
      
      results.articles = articles;
      
      if (articlesError) {
        results.errors.push({
          source: '게시글 조회',
          error: articlesError,
          message: articlesError.message
        });
      }
    } catch (e) {
      results.errors.push({
        source: '게시글 조회 예외',
        error: e
      });
    }
    
    return NextResponse.json({
      ...results,
      success: results.errors.length === 0,
      message: results.errors.length === 0 
        ? 'Supabase 데이터 조회 성공' 
        : `조회 중 ${results.errors.length}개 오류 발생`
    });
  } catch (error) {
    console.error('API 실행 중 오류 발생:', error);
    return NextResponse.json({ 
      error: '서버 오류 발생', 
      details: error 
    }, { status: 500 });
  }
} 