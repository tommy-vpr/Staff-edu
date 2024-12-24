"use client";

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SessionProvider as NextAuthProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/lib/SessionContext";
import Head from "next/head";
import { DynamicHead } from "@/components/my-components/DynamicHead";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootComponent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <DynamicHead />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
              <Toaster position="top-right" reverseOrder={false} />
            </ThemeProvider>
          </SessionProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
