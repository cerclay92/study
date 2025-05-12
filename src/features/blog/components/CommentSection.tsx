"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { getComments, createComment, Comment } from "@/features/blog/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MessageSquare, User, Mail, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface CommentSectionProps {
  articleId: number;
}

const commentSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  content: z.string().min(5, "댓글 내용은 5자 이상이어야 합니다."),
});

type CommentFormData = z.infer<typeof commentSchema>;

export function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: "",
      content: "",
    },
  });

  // 댓글 목록 가져오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getComments(articleId);
        
        if (error) {
          console.error("댓글 가져오기 오류:", error);
          return;
        }
        
        if (data) {
          setComments(data);
        }
      } catch (error) {
        console.error("댓글 가져오기 예외:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [articleId]);

  // 댓글 작성 제출 처리
  const onSubmit = async (data: CommentFormData) => {
    try {
      setIsLoading(true);
      
      const { error } = await createComment({
        article_id: articleId,
        name: data.name,
        content: data.content,
      });
      
      if (error) {
        console.error("댓글 작성 오류:", error);
        setSubmitStatus("error");
        return;
      }
      
      // 성공 메시지 표시
      setSubmitStatus("success");
      // 폼 초기화
      form.reset();
      
      // 잠시 후 상태 초기화
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 3000);
      
    } catch (error) {
      console.error("댓글 작성 예외:", error);
      setSubmitStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>댓글 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="이름을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>댓글 내용</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="댓글을 작성해주세요" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "작성 중..." : "댓글 작성"}
              </Button>
              
              {submitStatus === "success" && (
                <p className="text-green-600 mt-2">
                  댓글이 작성되었습니다. 관리자 승인 후 표시됩니다.
                </p>
              )}
              
              {submitStatus === "error" && (
                <p className="text-red-600 mt-2">
                  댓글 작성 중 오류가 발생했습니다. 다시 시도해주세요.
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>댓글 {comments.length}개</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground">댓글을 불러오는 중입니다...</p>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground">아직 댓글이 없습니다.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{comment.name}</h4>
                  <span className="text-sm text-muted-foreground">
                    {comment.created_at && formatDate(new Date(comment.created_at))}
                  </span>
                </div>
                <p className="text-muted-foreground">{comment.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 댓글 아이템 컴포넌트
interface CommentItemProps {
  comment: Comment & { replies?: Comment[] };
  onReply: (commentId: number) => void;
  depth?: number;
}

function CommentItem({ comment, onReply, depth = 0 }: CommentItemProps) {
  const formattedDate = format(new Date(comment.created_at), "yyyy-MM-dd HH:mm");
  const authorName = comment.author_name || "사용자";
  
  return (
    <div className={`${depth > 0 ? "ml-8 pl-6 border-l" : ""}`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{authorName}</span>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
          
          <div className="text-sm mb-3">{comment.content}</div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onReply(comment.id)}
          >
            <ChevronRight className="h-3 w-3 mr-1" />
            답글
          </Button>
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-6 space-y-6">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
} 