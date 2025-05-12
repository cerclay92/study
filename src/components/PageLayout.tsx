"use client";

import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export default function PageLayout({
  children,
  hideHeader = false,
  hideFooter = false,
}: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && <Header />}
      <main className="flex-grow pt-24">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
} 