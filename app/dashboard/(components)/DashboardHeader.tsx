"use client";

import Link from "next/link";
import {
  Bell,
  CircleUser,
  Code,
  GraduationCap,
  Home,
  LineChart,
  Menu,
  NotebookPen,
  Package,
  Package2,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import Orders from "@/components/ui/Orders";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { DataTable } from "@/components/my-components/Data";

import React from "react";
import { signOut, useSession } from "next-auth/react";

const DashboardHeader = () => {
  const { data: session, status } = useSession();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            <Link
              href="/dashboard/codes"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/education"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
            >
              <GraduationCap className="h-5 w-5" />
              Education
            </Link>
            <Link
              href="/dashboard/codes"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Code className="h-5 w-5" />
              Influencer Test
            </Link>
            <Link
              href="/dashboard/codes"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Code className="h-5 w-5" />
              Influencer Test
            </Link>
            <Button onClick={() => signOut({ callbackUrl: "/login" })}>
              Signout
            </Button>
          </nav>
          <div className="mt-auto">
            <Button size="sm" className="w-full">
              Upgrade
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1"></div>
      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {session?.user.role === "admin" && (
            <DropdownMenuItem>
              <Link href="/dashboard/account">Setting</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default DashboardHeader;
