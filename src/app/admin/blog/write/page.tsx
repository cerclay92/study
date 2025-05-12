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
import { Loader2, Save, Eye, Upload, CheckCircle2, AlertCircle, FilePenLine } from "lucide-react";
import { 
  createArticle, 
  saveDraft, 
  getTags,
  createTag,
  uploadFile 
} from "@/features/blog/api";
import type { Tag } from "@/features/blog/api";

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
  published: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export default function BlogWritePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  // 인증 여부 확인
  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("인증되지 않은 사용자 접근");
      toast.error("로그인이 필요합니다");
      router.push("/auth/login-idpw?callbackUrl=/admin/blog/write");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      console.log("일반 사용자가 관리자 페이지 접근 시도");
      toast.error("관리자 권한이 필요합니다");
      router.push("/");
    } else if (status === "authenticated") {
      console.log("인증된 관리자 접근:", session?.user?.name);
    }
  }, [status, session, router]);

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
      published: false,
    },
  });
  
  const { watch, reset } = form;
  
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

  // 제목이 변경되면 자동으로 슬러그 생성
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title" && value.title) {
        // 현재 시간 타임스탬프를 추가하여 고유한 슬러그 생성
        const timestamp = new Date().getTime();
        const slug = value.title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "") // 특수문자 제거
          .replace(/\s+/g, "-") // 공백을 하이픈으로 변경
          .replace(/--+/g, "-") // 중복 하이픈 제거
          .replace(/^-+/, "") // 시작 부분의 하이픈 제거
          .replace(/-+$/, "") // 끝 부분의 하이픈 제거
          .substring(0, 40); // 최대 길이 제한

        form.setValue(
          "slug",
          `${slug}-${timestamp.toString().slice(-6)}` // 타임스탬프 마지막 6자리 추가
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, form]);

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
      console.log("이미지 업로드 시작:", file.name);
      const { data, error } = await uploadFile(file);
      
      if (error) {
        console.error("이미지 업로드 오류:", error);
        toast.error(error.message || "이미지 업로드에 실패했습니다");
        return;
      }
      
      if (data) {
        console.log("업로드 성공, URL:", data);
        setImageUrl(data);
        form.setValue("featured_image", data);
        toast.success("이미지가 업로드되었습니다");
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      toast.error("이미지 업로드 중 오류가 발생했습니다");
    } finally {
      setIsLoadingImage(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  // 폼 제출 처리
  const onSubmit = async (data: FormData) => {
    console.log("폼 제출 시작", data);
    
    if (!data.title || !data.content || !data.slug || !data.category_id) {
      toast.error("필수 항목을 모두 입력해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      // 세션에서 현재 로그인한 사용자 정보 확인
      if (!session?.user?.id || session.user.role !== "admin") {
        throw new Error("관리자 권한이 필요합니다.");
      }

      // tags 필드 분리 (API 호출에서 별도로 처리하기 위해)
      const { tags, ...restData } = data;

      // 필요한 데이터만 포함
      const formattedData = {
        title: restData.title,
        content: restData.content,
        slug: restData.slug,
        excerpt: restData.excerpt || null,
        category_id: parseInt(restData.category_id),
        featured_image: restData.featured_image || null,
        published: true,
        published_at: new Date().toISOString(),
      };

      // API 호출 전 로그
      console.log("API 호출 시작:", formattedData);
      console.log("API 호출 태그 정보:", tags);

      const { data: articleId, error } = await createArticle(
        formattedData,
        tags?.map(id => parseInt(id))
      );

      if (error) {
        console.error("API 에러 상세 정보:", error);
        throw error;
      }

      toast.success("게시글이 발행되었습니다");
      router.push("/admin/blog");
    } catch (error) {
      console.error("게시글 발행 오류:", error);
      toast.error(`게시글 발행에 실패했습니다: ${error.message || "알 수 없는 오류가 발생했습니다"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 임시저장 처리
  const handleSaveDraft = async () => {
    // 최소한 제목만 있으면 저장 가능
    if (!form.getValues("title")) {
      toast.error("제목을 입력해주세요");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 세션에서 현재 로그인한 사용자 정보 확인
      if (!session?.user?.id || session.user.role !== "admin") {
        throw new Error("관리자 권한이 필요합니다.");
      }
      
      const draftData = {
        title: form.getValues("title"),
        content: form.getValues("content"),
        category_id: form.getValues("category_id") 
          ? parseInt(form.getValues("category_id")) 
          : undefined,
      };
      
      console.log("임시저장 데이터:", draftData);
      
      const { data: draftId, error } = await saveDraft(draftData);
      
      if (error) {
        console.error("임시저장 에러 상세:", JSON.stringify(error));
        throw error;
      }
      
      toast.success("임시저장 되었습니다");
    } catch (error) {
      console.error("임시저장 오류:", error);
      console.error("임시저장 오류 상세:", JSON.stringify(error));
      toast.error(`임시저장에 실패했습니다: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout>
      <div className="container py-10">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">글쓰기</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving || isSubmitting}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    임시저장
                  </>
                )}
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting || isSaving}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>발행하기</>
                )}
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">글쓰기</TabsTrigger>
              <TabsTrigger value="preview">미리보기</TabsTrigger>
            </TabsList>
            
            <TabsContent value="write" className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>제목</FormLabel>
                          <FormControl>
                            <Input placeholder="제목을 입력하세요" {...field} />
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
                            <Input placeholder="URL에 사용될 슬러그" {...field} />
                          </FormControl>
                          <FormDescription>
                            영문, 숫자, 하이픈(-)만 사용 가능합니다
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>카테고리</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="카테고리를 선택하세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            <div className="relative aspect-video mb-4 rounded-md overflow-hidden border h-64 max-h-80">
                              {isLoadingImage ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                  <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                              ) : (
                                <img 
                                  src={imageUrl || "https://picsum.photos/id/24/800/600"}
                                  alt="대표 이미지"
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "https://picsum.photos/id/24/800/600";
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-[200px]"
                                disabled={isLoadingImage}
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = handleImageUpload;
                                  input.click();
                                }}
                              >
                                {isLoadingImage ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    업로드 중...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    이미지 업로드
                                  </>
                                )}
                              </Button>
                              {imageUrl && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => {
                                    setImageUrl("");
                                    field.onChange("");
                                  }}
                                >
                                  이미지 제거
                                </Button>
                              )}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 본문 입력 필드 추가 */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>본문</FormLabel>
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