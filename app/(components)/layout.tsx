import React from "react";
import "../globals.css";
import { Providers } from "../providers";
import SidebarLayout from "@/components/layout/SidebarLayout";
import AdminLayout from "@/components/AdminLayout";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-screen bg-white font-sans text-black antialiased dark:bg-black dark:text-white">
      
        <Providers>
          <SidebarLayout>
            <AdminLayout>{children}</AdminLayout>
          </SidebarLayout>
        </Providers>
    
    </div>
  );
}