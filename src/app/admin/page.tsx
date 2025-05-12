"use client";

import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"all" | "published" | "draft">("all");
  const router = useRouter();

  // 게시글 목록 fetch
  useEffect(() => {
    const fetchArticles = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("게시글을 불러오지 못했습니다");
        return;
      }
      setArticles(data || []);
    };
    fetchArticles();
  }, []);

  // 삭제
  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) {
      toast.error("삭제 실패");
      return;
    }
    setArticles((prev) => prev.filter((a) => a.id !== id));
    toast.success("삭제 완료");
  };

  // 필터링
  const filteredArticles = articles.filter(article => {
    const matchesSearch = (article.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (article.category?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (article.author?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    if (currentView === "all") return matchesSearch;
    if (currentView === "published") return matchesSearch && article.published;
    if (currentView === "draft") return matchesSearch && !article.published;
    return false;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">게시글 관리</h1>
          <Button asChild>
            <Link href="/admin/blog/write">
              <Plus className="mr-2 h-4 w-4" />
              새 게시글 작성
            </Link>
          </Button>
        </div>
        
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                총 게시글
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                발행된 게시글
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {articles.filter(article => article.published).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                임시 저장 게시글
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {articles.filter(article => !article.published).length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 필터 및 검색 */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex space-x-2">
            <Button 
              variant={currentView === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setCurrentView("all")}
            >
              모든 게시글
            </Button>
            <Button 
              variant={currentView === "published" ? "default" : "outline"} 
              size="sm"
              onClick={() => setCurrentView("published")}
            >
              발행됨
            </Button>
            <Button 
              variant={currentView === "draft" ? "default" : "outline"} 
              size="sm"
              onClick={() => setCurrentView("draft")}
            >
              임시 저장
            </Button>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="게시글 검색..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* 게시글 테이블 */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead>작성자</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.category || article.categories?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={article.published ? "default" : "secondary"}>
                        {article.published ? "발행됨" : "임시 저장"}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.created_at ? new Date(article.created_at).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{article.author || article.author_name || "관리자"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/article/${article.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">보기</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/blog/edit/${article.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">수정</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(article.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">삭제</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    게시글이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
} 