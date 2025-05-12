"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { match } from "ts-pattern";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Eye, Upload, ArrowLeft } from "lucide-react";
import { 
  updateArticle, 
  getTags,
  createTag,
  uploadFile,
  getArticleBySlug 
} from "@/features/blog/api";
import type { Tag, ArticleWithCategory } from "@/features/blog/api";
import React from "react";

// 입력 스키마 정의
const formSchema = z.object({
  title: z.string().min(1, { message: "제목을 입력해주세요" }),
  content: z.string().min(1, { message: "내용을 입력해주세요" }),
  slug: z.string()
    .min(1, { message: "슬러그를 입력해주세요" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { 
      message: "슬러그는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다"
    }),
  excerpt: z.string().max(300, { 
    message: "요약은 최대 300자까지 입력 가능합니다"
  }).optional(),
  category_id: z.string().min(1, { message: "카테고리를 선택해주세요" }),
  tags: z.array(z.string()).optional(),
  featured_image: z.string().optional(),
  published: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

export default function EditArticlePage({ params }: { params: { id: string } }) {
  // Next.js 14+ params는 Promise이므로 React.use()로 언래핑
  const { id } = React.use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [preview, setPreview] = useState<{
    title: string;
    content: string;
    slug: string;
  }>({
    title: "",
    content: "",
    slug: "",
  });
  const [activeTab, setActiveTab] = useState("write");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [article, setArticle] = useState<ArticleWithCategory | null>(null);

  // 인증 여부 확인
  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("인증되지 않은 사용자 접근");
      toast.error("로그인이 필요합니다");
      router.push("/auth/login-idpw?callbackUrl=/admin/blog/edit/" + id);
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      console.log("일반 사용자가 관리자 페이지 접근 시도");
      toast.error("관리자 권한이 필요합니다");
      router.push("/");
    } else if (status === "authenticated") {
      console.log("인증된 관리자 접근:", session?.user?.name);
    }
  }, [status, session, router, id]);

  // 폼 초기화
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      slug: "",
      excerpt: "",
      category_id: "",
      tags: [],
      featured_image: "",
      published: true,
    },
  });
  
  const { watch, reset } = form;
  
  // 게시글 정보 가져오기
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        toast.error("잘못된 접근입니다. (id 없음)");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const supabase = createClient();
        
        console.log("게시글 조회 시작 - ID:", id);
        
        // 1. 기본 게시글 정보 조회
        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("id", id)
          .single();

        if (articleError) {
          console.error("게시글 조회 오류 상세:", {
            code: articleError.code,
            message: articleError.message,
            details: articleError.details,
            hint: articleError.hint
          });
          toast.error(`게시글을 불러오는데 실패했습니다: ${articleError.message}`);
          setIsLoading(false);
          return;
        }

        if (!articleData) {
          console.error("게시글 데이터 없음 - ID:", id);
          toast.error("게시글을 찾을 수 없습니다");
          setIsLoading(false);
          return;
        }

        console.log("게시글 기본 데이터 조회 성공:", articleData);

        // 2. 카테고리 정보 조회
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("id, name")
          .eq("id", articleData.category_id)
          .single();

        if (categoryError) {
          console.error("카테고리 조회 오류:", categoryError);
        }

        // 3. 작성자 정보 조회 - auth.users 테이블 사용
        let authorData = null;
        if (articleData.author_id) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, full_name")
            .eq("id", articleData.author_id)
            .single();

          if (userError) {
            console.error("작성자 조회 오류 (users):", userError);
            // auth.users 테이블에서 재시도
            const { data: authUserData, error: authUserError } = await supabase
              .from("auth_users")
              .select("id, full_name")
              .eq("id", articleData.author_id)
              .single();

            if (authUserError) {
              console.error("작성자 조회 오류 (auth.users):", authUserError);
            } else {
              authorData = authUserData;
            }
          } else {
            authorData = userData;
          }
        }

        // 4. 태그 정보 조회
        const { data: tagsData, error: tagsError } = await supabase
          .from("article_tags")
          .select(`
            tags (
              id,
              name
            )
          `)
          .eq("article_id", id);

        if (tagsError) {
          console.error("태그 조회 오류:", tagsError);
        }

        console.log("태그 데이터 조회 결과:", tagsData);

        const tags = tagsData?.map(item => item.tags) || [];

        // 모든 데이터 통합
        const completeArticleData = {
          ...articleData,
          category: categoryData || null,
          author: authorData || null,
          tags
        };

        console.log("통합된 게시글 데이터:", completeArticleData);

        // 폼 초기값 설정
        const formData = {
          title: completeArticleData.title || "",
          content: completeArticleData.content || "",
          slug: completeArticleData.slug || "",
          excerpt: completeArticleData.excerpt || "",
          category_id: completeArticleData.category_id?.toString() || "",
          tags: completeArticleData.tags.map(tag => tag.id.toString()),
          featured_image: completeArticleData.featured_image || "",
          published: completeArticleData.published || false,
        };

        console.log("폼 데이터 설정:", formData);

        setArticle({
          ...completeArticleData,
          author_name: completeArticleData.author?.full_name
        });

        reset(formData);
        setSelectedTags(formData.tags);
        
        if (formData.featured_image) {
          setImageUrl(formData.featured_image);
        }

      } catch (error) {
        console.error("게시글 데이터 처리 중 예외 발생:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        toast.error("게시글 데이터를 처리하는 중 오류가 발생했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchArticle();
    }
  }, [status, id, reset]);
  
  // 폼 값 변화 감지하여 미리보기 업데이트
  const title = watch("title");
  const content = watch("content");
  const slug = watch("slug");
  
  useEffect(() => {
    setPreview({
      title,
      content,
      slug,
    });
  }, [title, content, slug]);

  // 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("카테고리 가져오기 오류:", error);
        toast.error("카테고리를 불러오는데 실패했습니다");
        return;
      }

      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  // 태그 목록 가져오기
  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await getTags();

      if (error) {
        console.error("태그 가져오기 오류:", error);
        toast.error("태그를 불러오는데 실패했습니다");
        return;
      }

      setAvailableTags(data || []);
    };

    fetchTags();
  }, []);

  // 새 태그 추가
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    setIsAddingTag(true);
    
    try {
      const { data, error } = await createTag({
        name: newTag.trim(),
      });
      
      if (error) throw error;
      
      if (data) {
        const newTagObject = { id: data, name: newTag.trim() };
        setAvailableTags(prev => [...prev, newTagObject]);
        setSelectedTags(prev => [...prev, data.toString()]);
        form.setValue("tags", [...(form.getValues("tags") || []), data.toString()]);
        setNewTag("");
        toast.success("새 태그가 추가되었습니다");
      }
    } catch (error) {
      console.error("태그 생성 오류:", error);
      toast.error("태그 추가에 실패했습니다");
    } finally {
      setIsAddingTag(false);
    }
  };

  // 태그 선택 토글
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => {
      const newSelection = prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId];
      
      form.setValue("tags", newSelection);
      return newSelection;
    });
  };

  // 대표 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoadingImage(true);
    
    try {
      console.log("이미지 업로드 시작:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("파일 크기는 10MB를 초과할 수 없습니다.");
      }

      // 이미지 타입 체크
      if (!file.type.startsWith("image/")) {
        throw new Error("이미지 파일만 업로드할 수 있습니다.");
      }

      const { data, error } = await uploadFile(file);
      
      if (error) {
        console.error("이미지 업로드 API 오류:", error);
        throw error;
      }
      
      if (data) {
        console.log("이미지 업로드 성공:", data);
        setImageUrl(data);
        form.setValue("featured_image", data);
        toast.success("이미지가 업로드되었습니다");
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error);
      toast.error(error.message || "이미지 업로드에 실패했습니다");
    } finally {
      setIsLoadingImage(false);
      if (e.target) {
        e.target.value = ""; // 파일 입력 초기화
      }
    }
  };

  // 폼 제출 처리
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // 디버깅 로그 추가
      console.log("폼 데이터:", data);
      
      // 세션 객체 전체 구조 출력
      console.log("세션 전체 구조:", JSON.stringify(session, null, 2));
      
      // 세션에서 현재 로그인한 사용자 정보 확인
      if (!session?.user?.id || session.user.role !== "admin") {
        throw new Error("관리자 권한이 필요합니다.");
      }
      
      // tags 필드 분리 (API 호출에서 별도로 처리하기 위해)
      const { tags, ...restData } = data;
      
      const formattedData = {
        ...restData,
        category_id: parseInt(restData.category_id),
        updated_at: new Date().toISOString(),
      };
      
      // API 호출 전 로그
      console.log("API 호출 시작:", formattedData);
      console.log("API 호출 태그 정보:", tags);
      
      const { error } = await updateArticle(
        parseInt(id),
        formattedData,
        tags?.map(id => parseInt(id))
      );
      
      if (error) {
        console.error("API 에러 상세 정보:", JSON.stringify(error));
        throw error;
      }
      
      toast.success("게시글이 업데이트되었습니다");
      router.push("/admin/blog");
    } catch (error) {
      console.error("게시글 업데이트 오류:", error);
      console.error("오류 상세 정보:", JSON.stringify(error));
      toast.error(`게시글 업데이트에 실패했습니다: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-8 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">게시글을 불러오는 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => router.push("/admin/blog")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">게시글 수정</h1>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>저장하기</>
              )}
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">글쓰기</TabsTrigger>
              <TabsTrigger value="preview">미리보기</TabsTrigger>
            </TabsList>
            
            <TabsContent value="write" className="space-y-4">
              <Form {...form}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>글 내용</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>제목</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="제목을 입력하세요" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>슬러그</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="url-friendly-slug" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  URL에 사용될 주소입니다. 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>내용</FormLabel>
                                <FormControl>
                                  <RichTextEditor
                                    content={field.value}
                                    onChange={field.onChange}
                                    placeholder="내용을 입력하세요..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>설정</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>카테고리</FormLabel>
                                <Select 
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="카테고리 선택" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem 
                                        key={category.id} 
                                        value={category.id.toString()}
                                      >
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormItem>
                            <FormLabel>태그</FormLabel>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {availableTags.map((tag) => (
                                <Button
                                  key={tag.id}
                                  type="button"
                                  variant={selectedTags.includes(tag.id.toString()) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleTag(tag.id.toString())}
                                >
                                  {tag.name}
                                </Button>
                              ))}
                            </div>
                          </FormItem>

                          <div className="flex gap-2">
                            <Input
                              placeholder="새 태그 추가"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddTag();
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              onClick={handleAddTag}
                              disabled={isAddingTag}
                            >
                              {isAddingTag ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "추가"
                              )}
                            </Button>
                          </div>

                          <FormField
                            control={form.control}
                            name="excerpt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>요약</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="글 요약을 입력하세요 (선택사항)" 
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  글 목록에 표시될 요약 내용입니다. 입력하지 않으면 본문에서 자동 추출됩니다.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="featured_image"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>대표 이미지</FormLabel>
                                <div className="mt-2">
                                  {imageUrl ? (
                                    <div className="relative aspect-video mb-4 rounded-md overflow-hidden border">
                                      <img 
                                        src={imageUrl} 
                                        alt="대표 이미지"
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                  ) : null}
                                  
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => document.getElementById('image-upload')?.click()}
                                      disabled={isLoadingImage}
                                    >
                                      {isLoadingImage ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          업로드 중...
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="mr-2 h-4 w-4" />
                                          이미지 업로드
                                        </>
                                      )}
                                    </Button>
                                    <Input
                                      id="image-upload"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleImageUpload}
                                      {...field}
                                      value=""
                                    />
                                    {imageUrl && (
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          setImageUrl("");
                                          form.setValue("featured_image", "");
                                        }}
                                      >
                                        제거
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="published"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>발행 상태</FormLabel>
                                  <FormDescription>
                                    체크하면 즉시 발행됩니다. 체크 해제하면 임시글로 저장됩니다.
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>{preview.title || "제목 없음"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {preview.content ? (
                      <div dangerouslySetInnerHTML={{ __html: preview.content }} />
                    ) : (
                      <p className="text-muted-foreground">미리보기 내용이 없습니다.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
} 