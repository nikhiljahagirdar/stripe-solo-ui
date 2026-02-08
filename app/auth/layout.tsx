import React from "react";
import type { Metadata } from "next";
import { Providers } from "../providers";
import AuthLayoutWrapper from "@/components/layout/AuthLayout";
import AuthInitializer from "@/components/auth/AuthInitializer";

export const metadata: Metadata = {
  title: "Stripe Management Dashboard - Auth",
  description: "Authentication pages for Stripe management interface",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <AuthInitializer skipAuth={true}>
        <AuthLayoutWrapper>
          <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 dark:from-violet-900 dark:via-purple-900 dark:to-indigo-950">
            {/* Animated gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>
            
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </AuthLayoutWrapper>
      </AuthInitializer>
    </Providers>
  );
}