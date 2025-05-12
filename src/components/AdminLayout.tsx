"use client";

import React from "react";
import { Button } from "./ui/button";
import { SERVICE_NAME } from "@/constants/theme";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, Users, Mail, Settings, LogOut, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminNavLink = ({ href, icon: Icon, label, isActive }: { 
  href: string; 
  icon: React.ElementType; 
  label: string;
  isActive: boolean;
}) => {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
      )}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const isLinkActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const nav = [
    { href: "/admin", icon: FileText, label: "게시글 관리" },
    { href: "/admin/subscribers", icon: Users, label: "구독자 관리" },
    { href: "/admin/newsletters", icon: Mail, label: "뉴스레터 관리" },
    { href: "/admin/settings", icon: Settings, label: "설정" },
  ];

  return (
    <div className="flex min-h-screen bg-secondary/20">
      {/* 사이드바 - 데스크톱 */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-white">
        <div className="p-4 border-b">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-primary font-bold"
          >
            <BookOpen className="w-6 h-6" />
            <span>{SERVICE_NAME}</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <AdminNavLink 
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isLinkActive(item.href)}
            />
          ))}
        </nav>
        
        <div className="p-4 border-t mt-auto">
          <Button variant="ghost" className="w-full flex items-center justify-start gap-3 text-muted-foreground" asChild>
            <Link href="/">
              <LogOut size={18} />
              <span>사이트로 돌아가기</span>
            </Link>
          </Button>
        </div>
        
        <div className="p-4 border-t mt-auto">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 text-muted-foreground"
            onClick={async () => {
              try {
                await signOut({ 
                  callbackUrl: "/",
                  redirect: true 
                });
                // 브라우저 캐시 및 로컬 스토리지 초기화
                if (typeof window !== "undefined") {
                  window.localStorage.clear();
                  window.sessionStorage.clear();
                }
              } catch (error) {
                console.error("로그아웃 중 오류:", error);
              }
            }}
          >
            <LogOut size={18} />
            <span>로그아웃</span>
          </Button>
        </div>
      </aside>
      
      {/* 모바일 레이아웃 */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b bg-white lg:hidden">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="메뉴 열기" className="lg:hidden">
                  <PanelLeft size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b">
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-2 text-primary font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    <BookOpen className="w-6 h-6" />
                    <span>{SERVICE_NAME}</span>
                  </Link>
                </div>
                
                <nav className="flex-1 p-4 space-y-1">
                  {nav.map((item) => (
                    <AdminNavLink 
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      isActive={isLinkActive(item.href)}
                    />
                  ))}
                </nav>
                
                <div className="p-4 border-t mt-auto">
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-start gap-3 text-muted-foreground"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/">
                      <LogOut size={18} />
                      <span>사이트로 돌아가기</span>
                    </Link>
                  </Button>
                </div>
                
                <div className="p-4 border-t mt-auto">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-start gap-3 text-muted-foreground"
                    onClick={async () => {
                      try {
                        await signOut({ 
                          callbackUrl: "/",
                          redirect: true 
                        });
                        // 브라우저 캐시 및 로컬 스토리지 초기화
                        if (typeof window !== "undefined") {
                          window.localStorage.clear();
                          window.sessionStorage.clear();
                        }
                      } catch (error) {
                        console.error("로그아웃 중 오류:", error);
                      }
                    }}
                  >
                    <LogOut size={18} />
                    <span>로그아웃</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-primary font-bold"
            >
              <BookOpen className="w-6 h-6" />
              <span>{SERVICE_NAME}</span>
            </Link>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 