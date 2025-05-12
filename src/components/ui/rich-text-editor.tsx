"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading, 
  Quote, 
  Image as ImageIcon,
  Code,
  LucideProps
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { uploadFile } from "@/features/blog/api";

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autofocus?: boolean;
  readOnly?: boolean;
}

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ComponentType<LucideProps>;
  label: string;
}

const MenuButton = ({ onClick, isActive, disabled, icon: Icon, label }: MenuButtonProps) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8"
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "내용을 입력하세요...", 
  autofocus = false,
  readOnly = false 
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLocalImageDialogOpen, setIsLocalImageDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        validate: href => /^https?:\/\//.test(href),
      }),
      Image,
      Placeholder.configure({
        placeholder,
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    autofocus,
    editable: !readOnly,
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    // 이미 링크가 있다면 취소
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    setIsLinkDialogOpen(true);
  }, [editor]);

  const confirmLink = useCallback(() => {
    if (!editor) return;

    // 링크가 비어있다면 처리하지 않음
    if (linkUrl === "") {
      setIsLinkDialogOpen(false);
      return;
    }

    // 유효한 URL인지 확인
    if (!/^https?:\/\//.test(linkUrl)) {
      alert("유효한 URL을 입력해주세요. (예: https://example.com)");
      return;
    }

    // 링크 추가
    editor
      .chain()
      .focus()
      .setLink({ href: linkUrl })
      .run();

    setLinkUrl("");
    setIsLinkDialogOpen(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor) return;
    setIsImageDialogOpen(true);
  }, [editor]);

  const confirmImage = useCallback(() => {
    if (!editor) return;

    // 이미지 URL이 비어있다면 처리하지 않음
    if (imageUrl === "") {
      setIsImageDialogOpen(false);
      return;
    }

    // 에디터에 이미지 추가
    editor
      .chain()
      .focus()
      .setImage({ src: imageUrl, alt: "사용자 업로드 이미지" })
      .run();

    setImageUrl("");
    setIsImageDialogOpen(false);
  }, [editor, imageUrl]);

  const uploadLocalImage = useCallback(async (file: File) => {
    if (!editor) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // 로딩 시뮬레이션
      const simulateProgress = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(simulateProgress);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // 실제 업로드
      const { data, error } = await uploadFile(file);
      
      clearInterval(simulateProgress);
      setUploadProgress(100);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        // 에디터에 이미지 추가
        editor
          .chain()
          .focus()
          .setImage({ 
            src: data, 
            alt: file.name 
          })
          .run();
      }
      
      setTimeout(() => {
        setIsUploading(false);
        setIsLocalImageDialogOpen(false);
      }, 500);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
      setIsUploading(false);
    }
  }, [editor]);

  const handleImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLocalImage(file);
    }
  }, [uploadLocalImage]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor border rounded-md flex flex-col">
      {!readOnly && (
        <div className="editor-menu border-b p-1 flex flex-wrap gap-0.5 bg-muted/20">
          <MenuButton
            icon={Bold}
            label="굵게"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          />
          <MenuButton
            icon={Italic}
            label="기울임"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          />
          <MenuButton
            icon={UnderlineIcon}
            label="밑줄"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
          />
          <MenuButton
            icon={LinkIcon}
            label="링크"
            onClick={setLink}
            isActive={editor.isActive("link")}
          />
          <div className="h-6 w-px bg-border mx-1" />
          <MenuButton
            icon={Heading}
            label="제목"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
          />
          <MenuButton
            icon={List}
            label="글머리 기호 목록"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
          />
          <MenuButton
            icon={ListOrdered}
            label="번호 매기기 목록"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
          />
          <MenuButton
            icon={Quote}
            label="인용구"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
          />
          <MenuButton
            icon={Code}
            label="코드 블록"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
          />
          <div className="h-6 w-px bg-border mx-1" />
          <MenuButton
            icon={ImageIcon}
            label="이미지"
            onClick={addImage}
          />
          <Dialog open={isLocalImageDialogOpen} onOpenChange={setIsLocalImageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">로컬 이미지 업로드</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>이미지 업로드</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageFileChange}
                  disabled={isUploading}
                />
                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-4 min-h-[200px] flex-grow focus:outline-none"
      />

      {/* 링크 다이얼로그 */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>링크 추가</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  confirmLink();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={confirmLink}>
                확인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 이미지 다이얼로그 */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>이미지 추가</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  confirmImage();
                }
              }}
            />
            <div className="flex justify-between">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setIsImageDialogOpen(false);
                  setIsLocalImageDialogOpen(true);
                }}
              >
                로컬 이미지 업로드
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={confirmImage}>
                  확인
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 