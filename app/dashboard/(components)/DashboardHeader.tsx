"use client";

import Link from "next/link";
import {
  CircleUser,
  Code,
  GraduationCap,
  Home,
  Menu,
  NotebookPen,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { ModeToggle } from "@/components/ui/ModeToggle";

import React from "react";
import { signOut, useSession } from "next-auth/react";

import { usePathname } from "next/navigation";
import clsx from "clsx";

const DashboardHeader = () => {
  const pathName = usePathname();
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
              href="/dashboard"
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                {
                  "flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary":
                    pathName === "/dashboard",
                }
              )}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/education"
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                {
                  "flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary":
                    pathName === "/dashboard/education",
                }
              )}
            >
              <GraduationCap className="h-4 w-4" />
              Education
            </Link>
            <Link
              href="/dashboard/influencer-test"
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                {
                  "flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary":
                    pathName === "/dashboard/influencer-test",
                }
              )}
            >
              <NotebookPen className="h-4 w-4" />
              Test
            </Link>
            {session?.user.role === "admin" && (
              <Link
                href="/dashboard/codes"
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  {
                    "flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary":
                      pathName === "/dashboard/codes",
                  }
                )}
              >
                <Code className="h-4 w-4" />
                Codes
              </Link>
            )}
            {session?.user.role === "admin" && (
              <Link
                href="/dashboard/account"
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  {
                    "flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary":
                      pathName === "/dashboard/account",
                  }
                )}
              >
                <Users className="h-4 w-4" />
                Account
              </Link>
            )}
            <Button onClick={() => signOut({ callbackUrl: "/login" })}>
              Signout
            </Button>
          </nav>
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
