"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { match } from "ts-pattern";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  MoreHorizontal,
  PencilLine,
  Trash2,
  Search,
  Clock,
  Plus,
  Upload,
  Filter,
} from "lucide-react";
import { ArticleWithCategory } from "@/features/blog/api";

// 게시글 목록 페이지
export default function BlogAdminPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleWithCategory[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: number | null }>({
    show: false,
    id: null,
  });

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchDrafts();
  }, [currentPage, selectedCategory]);

  // 게시글 목록 가져오기
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("articles")
        .select(`
          *,
          categories:category_id(id, name)
        `)
        .order("created_at", { ascending: false });

      // 카테고리 필터
      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      // 검색어
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      // 페이지네이션
      const limit = 10;
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("게시글 쿼리 오류:", error.message, error.details, error.hint);
        throw error;
      }

      // 총 페이지 수 계산
      if (count !== null) {
        setTotalPages(Math.ceil(count / limit));
      }

      // 태그 정보를 가져와서 추가
      if (data) {
        const articlesWithTags = await Promise.all(
          data.map(async (article: any) => {
            try {
              // 태그 정보 가져오기
              const { data: tagData, error: tagError } = await supabase
                .from("article_tags")
                .select("tags(*)")
                .eq("article_id", article.id);
                
              if (tagError) {
                console.error("태그 조회 오류:", tagError.message);
                return {
                  ...article,
                  tags: []
                };
              }

              // 작성자 정보가 필요하면 여기서 별도 쿼리로 가져오기
              // const { data: userData } = await supabase
              //   .from("users")
              //   .select("full_name")
              //   .eq("id", article.author_id)
              //   .single();
              
              return {
                ...article,
                tags: tagData?.map((t: any) => t.tags) || [],
                // author_name: userData?.full_name || "관리자"
              };
            } catch (err) {
              console.error("태그 처리 오류:", err);
              return { ...article, tags: [] };
            }
          })
        );

        setArticles(articlesWithTags as ArticleWithCategory[]);
      }
    } catch (error) {
      console.error("게시글 가져오기 오류:", error);
      if (error instanceof Error) {
        console.error("오류 세부 내용:", error.message, error.stack);
      } else {
        console.error("오류 객체:", JSON.stringify(error));
      }
      toast.error("게시글 목록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("카테고리 가져오기 오류:", error);
    }
  };

  // 임시저장 목록 가져오기
  const fetchDrafts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("drafts")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error("임시저장 가져오기 오류:", error);
    }
  };

  // 게시글 삭제
  const deleteArticle = async (id: number) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setArticles((prev) => prev.filter((article) => article.id !== id));
      toast.success("게시글이 삭제되었습니다");
    } catch (error) {
      console.error("게시글 삭제 오류:", error);
      toast.error("게시글 삭제에 실패했습니다");
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };

  // 발행 상태 변경
  const togglePublishStatus = async (id: number, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const newStatus = !currentStatus;
      
      const updateData: Record<string, any> = {
        published: newStatus,
      };
      
      // 새로 발행하는 경우에만 발행일 추가
      if (newStatus) {
        updateData.published_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from("articles")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setArticles((prev) =>
        prev.map((article) =>
          article.id === id ? { ...article, published: newStatus } : article
        )
      );

      toast.success(
        newStatus ? "게시글이 발행되었습니다" : "게시글이 비공개로 전환되었습니다"
      );
    } catch (error) {
      console.error("발행 상태 변경 오류:", error);
      toast.error("발행 상태 변경에 실패했습니다");
    }
  };

  // 임시저장 글 삭제
  const deleteDraft = async (id: number) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("drafts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setDrafts((prev) => prev.filter((draft) => draft.id !== id));
      toast.success("임시저장 글이 삭제되었습니다");
    } catch (error) {
      console.error("임시저장 삭제 오류:", error);
      toast.error("임시저장 삭제에 실패했습니다");
    }
  };

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  return (
    <PageLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">블로그 관리</h1>
          <Button asChild>
            <Link href="/admin/blog/write">
              <Plus className="mr-2 h-4 w-4" />
              새 글 작성
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="카테고리 전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {categories.map((category) => (
                    category.id ? (
                      <SelectItem 
                        key={category.id} 
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ) : null
                  ))}
                </SelectContent>
              </Select>
            </div>

            <form onSubmit={handleSearch} className="flex w-full max-w-sm gap-2">
              <Input
                placeholder="제목 또는 내용 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <Button type="submit" variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead className="w-1/3">제목</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>작성일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                      <p className="text-muted-foreground mt-2">게시글을 불러오는 중...</p>
                    </TableCell>
                  </TableRow>
                ) : articles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <p className="text-muted-foreground">게시글이 없습니다.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>{article.id}</TableCell>
                      <TableCell>
                        <div className="line-clamp-1 font-medium">
                          {article.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        {article.categories?.name}
                      </TableCell>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/article/${article.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                보기
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/blog/edit/${article.id}`}>
                                <PencilLine className="mr-2 h-4 w-4" />
                                수정
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePublishStatus(article.id, article.published)}>
                              <Upload className="mr-2 h-4 w-4" />
                              {article.published ? "비공개로 전환" : "발행하기"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setConfirmDelete({ show: true, id: article.id })}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination className="my-4">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="ghost"
                  >
                    <PaginationPrevious />
                  </Button>
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="ghost"
                  >
                    <PaginationNext />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* 임시저장 목록 */}
          {drafts.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                임시저장 ({drafts.length})
              </h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>마지막 수정일</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drafts.map((draft) => (
                      <TableRow key={draft.id}>
                        <TableCell>
                          <div className="line-clamp-1 font-medium">
                            {draft.title || "(제목 없음)"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {draft.updated_at && 
                            format(new Date(draft.updated_at), "yyyy-MM-dd HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => router.push(`/admin/blog/draft/${draft.id}`)}
                            >
                              수정
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteDraft(draft.id)}
                            >
                              삭제
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* 삭제 확인 다이얼로그 */}
        <Dialog
          open={confirmDelete.show}
          onOpenChange={(open) => !open && setConfirmDelete({ show: false, id: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>게시글 삭제</DialogTitle>
              <DialogDescription>
                이 게시글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete({ show: false, id: null })}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDelete.id && deleteArticle(confirmDelete.id)}
              >
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
} 