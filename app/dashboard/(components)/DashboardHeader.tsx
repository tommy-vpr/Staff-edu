"use client";

import Link from "next/link";
import { Code, Home, Menu, NotebookPen, User, Users } from "lucide-react";

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
import Image from "next/image";

import littoLogo from "@/assets/images/litto-logo-blk.webp";

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
          <nav className="grid gap-2 text-lg font-medium mt-8">
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
              href="/dashboard/quiz"
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                {
                  "flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary":
                    pathName === "/dashboard/quiz",
                }
              )}
            >
              <NotebookPen className="h-4 w-4" />
              Quiz
            </Link>
            <Link
              href="/dashboard/contact"
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                {
                  "flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary":
                    pathName === "/dashboard/contact",
                }
              )}
            >
              <NotebookPen className="h-4 w-4" />
              Contact
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
              Logout
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-[56px] w-full flex-1 flex justify-center items-center">
        <Link href="/dashboard">
          <Image
            src={littoLogo}
            alt="litto logo"
            width={100}
            height={30}
            className="dark:invert block md:hidden"
          />
        </Link>
      </div>
      {/* User name */}
      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <span className="capitalize p-[5px] border-b w-full border-b-gray-800 block text-green-400">
            {session?.user.name}
          </span>
          {session?.user.role === "admin" && (
            <Link href="/dashboard/account">
              <DropdownMenuItem className="cursor-pointer">
                Setting
              </DropdownMenuItem>
            </Link>
          )}
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="cursor-pointer"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default DashboardHeader;
