"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  FilePenLine,
  Eye,
  Users,
  ArrowUpRight,
  ArrowDown,
  User,
  ArrowUp,
  MessageSquare,
  FileEdit,
  Calendar,
  Tag,
  PencilLine,
  MoreHorizontal,
  Trash2,
  Search,
  Clock,
  Plus,
  Upload,
  Filter,
} from "lucide-react";
import { ArticleWithCategory } from "@/features/blog/api";

// 대시보드 메인 페이지
export default function AdminDashboard() {
  const [statistics, setStatistics] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    totalViews: 0,
    totalComments: 0,
    totalTags: 0,
    visitorToday: 0,
    visitorChange: 0,
  });
  const [recentArticles, setRecentArticles] = useState<ArticleWithCategory[]>([]);
  const [popularArticles, setPopularArticles] = useState<ArticleWithCategory[]>([]);
  const [visitStats, setVisitStats] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
    fetchRecentArticles();
    fetchPopularArticles();
    fetchVisitStats();
    fetchCategoryStats();
  }, []);

  // 통계 데이터 가져오기
  const fetchStatistics = async () => {
    try {
      const supabase = createClient();
      
      // 총 게시글 수
      const { count: totalArticles } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true });
      
      // 발행된 게시글 수
      const { count: publishedArticles } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("published", true);
      
      // 총 조회수 (통계 테이블에서 가져오기)
      const { data: viewsData } = await supabase
        .from("visit_statistics")
        .select("visitor_count")
        .not('article_id', 'is', null);
      
      const totalViews = viewsData?.reduce((sum, item) => sum + item.visitor_count, 0) || 0;
      
      // 총 댓글 수
      const { count: totalComments } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true });
      
      // 총 태그 수
      const { count: totalTags } = await supabase
        .from("tags")
        .select("*", { count: "exact", head: true });
      
      // 오늘 방문자 수
      const today = new Date().toISOString().split('T')[0];
      const { data: todayVisits } = await supabase
        .from("visit_statistics")
        .select("visitor_count")
        .eq("date", today);
      
      const visitorToday = todayVisits?.reduce((sum, item) => sum + item.visitor_count, 0) || 0;
      
      // 어제 방문자 수 (변화율 계산용)
      const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
      const { data: yesterdayVisits } = await supabase
        .from("visit_statistics")
        .select("visitor_count")
        .eq("date", yesterday);
      
      const visitorYesterday = yesterdayVisits?.reduce((sum, item) => sum + item.visitor_count, 0) || 0;
      
      // 방문자 변화율 계산
      const visitorChange = visitorYesterday > 0 
        ? Math.round(((visitorToday - visitorYesterday) / visitorYesterday) * 100)
        : 0;
      
      setStatistics({
        totalArticles: totalArticles || 0,
        publishedArticles: publishedArticles || 0,
        totalViews,
        totalComments: totalComments || 0,
        totalTags: totalTags || 0,
        visitorToday,
        visitorChange,
      });
    } catch (error) {
      console.error("통계 가져오기 오류:", error);
      toast.error("통계 데이터를 불러오는데 실패했습니다.");
    }
  };

  // 최근 게시글 가져오기
  const fetchRecentArticles = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          categories:category_id(id, name),
          author:author_id(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // 태그 정보 가져오기
      if (data) {
        const articlesWithTags = await Promise.all(
          data.map(async (article: any) => {
            const { data: tagData } = await supabase
              .from("article_tags")
              .select("tags(*)")
              .eq("article_id", article.id);

            return {
              ...article,
              tags: tagData?.map((t: any) => t.tags) || [],
            };
          })
        );

        setRecentArticles(articlesWithTags as ArticleWithCategory[]);
      }
    } catch (error) {
      console.error("최근 게시글 가져오기 오류:", error);
    }
  };

  // 인기 게시글 가져오기
  const fetchPopularArticles = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      // 조회수 기준으로 게시글 ID 목록 가져오기
      const { data: viewsData } = await supabase
        .from("visit_statistics")
        .select("article_id, visitor_count")
        .not('article_id', 'is', null);
      
      // 게시글 ID별 조회수 합계 계산
      const viewsByArticle: Record<number, number> = {};
      viewsData?.forEach(item => {
        const id = item.article_id;
        if (id) {
          viewsByArticle[id] = (viewsByArticle[id] || 0) + item.visitor_count;
        }
      });
      
      // 조회수 기준으로 정렬된 게시글 ID 목록
      const sortedIds = Object.entries(viewsByArticle)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => parseInt(id));
      
      if (sortedIds.length === 0) {
        setPopularArticles([]);
        setIsLoading(false);
        return;
      }
      
      // 인기 게시글 정보 가져오기
      const { data: articles } = await supabase
        .from("articles")
        .select(`
          *,
          categories:category_id(id, name),
          author:author_id(full_name)
        `)
        .in("id", sortedIds);
      
      // 조회수 정보 추가 및 정렬
      const articlesWithViews = articles?.map(article => ({
        ...article,
        views: viewsByArticle[article.id] || 0,
      })).sort((a, b) => b.views - a.views);
      
      setPopularArticles(articlesWithViews as ArticleWithCategory[]);
    } catch (error) {
      console.error("인기 게시글 가져오기 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 방문자 통계 가져오기
  const fetchVisitStats = async () => {
    try {
      const supabase = createClient();
      
      // 최근 7일간 방문자 데이터
      const endDate = new Date();
      const startDate = subDays(endDate, 6);
      
      const dates = [];
      for (let i = 0; i <= 6; i++) {
        dates.push(format(subDays(endDate, 6 - i), "yyyy-MM-dd"));
      }
      
      // 날짜별 방문자 데이터 가져오기
      const { data } = await supabase
        .from("visit_statistics")
        .select("date, visitor_count")
        .in("date", dates);
      
      // 날짜별 방문자 수 합계 계산
      const statsMap: Record<string, number> = {};
      data?.forEach(item => {
        statsMap[item.date] = (statsMap[item.date] || 0) + item.visitor_count;
      });
      
      // 차트 데이터 형식으로 변환
      const chartData = dates.map(date => ({
        date: format(new Date(date), "M/d"),
        방문자: statsMap[date] || 0,
      }));
      
      setVisitStats(chartData);
    } catch (error) {
      console.error("방문자 통계 가져오기 오류:", error);
    }
  };

  // 카테고리별 게시글 통계
  const fetchCategoryStats = async () => {
    try {
      const supabase = createClient();
      
      // 카테고리 목록 가져오기
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name");
      
      if (!categories) return;
      
      // 카테고리별 게시글 수 계산
      const stats = await Promise.all(
        categories.map(async category => {
          const { count } = await supabase
            .from("articles")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("published", true);
          
          return {
            name: category.name,
            value: count || 0,
          };
        })
      );
      
      // 게시글이 있는 카테고리만 필터링
      const filteredStats = stats.filter(item => item.value > 0);
      
      setCategoryStats(filteredStats);
    } catch (error) {
      console.error("카테고리 통계 가져오기 오류:", error);
    }
  };
  
  // 차트 컬러 팔레트
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <PageLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">대시보드</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/blog">
                <FilePenLine className="mr-2 h-4 w-4" />
                블로그 관리
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/blog/write">
                <FileEdit className="mr-2 h-4 w-4" />
                새 글 작성
              </Link>
            </Button>
          </div>
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 게시글</CardTitle>
              <FilePenLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalArticles}</div>
              <p className="text-xs text-muted-foreground mt-1">
                발행됨: {statistics.publishedArticles} / 비공개: {statistics.totalArticles - statistics.publishedArticles}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                평균: {statistics.publishedArticles > 0 
                  ? Math.round(statistics.totalViews / statistics.publishedArticles).toLocaleString() 
                  : 0} / 게시글
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">오늘 방문자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.visitorToday.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {statistics.visitorChange > 0 ? (
                  <>
                    <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">{statistics.visitorChange}%</span>
                  </>
                ) : statistics.visitorChange < 0 ? (
                  <>
                    <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-red-500">{Math.abs(statistics.visitorChange)}%</span>
                  </>
                ) : (
                  <span>변화 없음</span>
                )}
                <span className="ml-1">전일 대비</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">통계</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div>
                  <div className="text-sm font-medium">태그</div>
                  <div className="text-xl font-bold">{statistics.totalTags}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">댓글</div>
                  <div className="text-xl font-bold">{statistics.totalComments}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 통계 그래프 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>방문자 통계</CardTitle>
              <CardDescription>최근 7일간 일일 방문자 수</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={visitStats}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="방문자"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>카테고리별 게시글</CardTitle>
              <CardDescription>발행된 게시글 기준</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 게시글 목록 섹션 */}
        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">최근 게시글</TabsTrigger>
            <TabsTrigger value="popular">인기 게시글</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>최근 게시글</CardTitle>
                <CardDescription>최근 작성된 5개 게시글</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentArticles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          게시글이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <div className="line-clamp-1 font-medium">
                              {article.title}
                            </div>
                          </TableCell>
                          <TableCell>{article.categories?.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span
                                className={`mr-2 h-2 w-2 rounded-full ${
                                  article.published ? "bg-green-500" : "bg-orange-500"
                                }`}
                              ></span>
                              {article.published ? "발행됨" : "비공개"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {article.created_at && 
                              format(new Date(article.created_at), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell className="text-right">
                            {article.published ? (
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/article/${article.slug}`} target="_blank">
                                  <Eye className="mr-2 h-4 w-4" />
                                  보기
                                </Link>
                              </Button>
                            ) : (
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/blog/edit/${article.id}`}>
                                  <PencilLine className="mr-2 h-4 w-4" />
                                  수정
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="popular">
            <Card>
              <CardHeader>
                <CardTitle>인기 게시글</CardTitle>
                <CardDescription>조회수 기준 상위 5개 게시글</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>조회수</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                          <p className="text-muted-foreground mt-2">데이터를 불러오는 중...</p>
                        </TableCell>
                      </TableRow>
                    ) : popularArticles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          아직 조회수 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      popularArticles.map((article: any) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <div className="line-clamp-1 font-medium">
                              {article.title}
                            </div>
                          </TableCell>
                          <TableCell>{article.categories?.name}</TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {article.views.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {article.created_at && 
                              format(new Date(article.created_at), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/article/${article.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                보기
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
} 