"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Code, Home, Mail, NotebookPen, Users } from "lucide-react";

import littoLogo from "@/assets/images/litto-logo-blk.webp";

const DashboardSideBar = () => {
  const pathName = usePathname();
  const { data: session, status } = useSession();
  const currentYear = new Date().getFullYear();

  return (
    <div className="hidden border-r bg-muted/40 md:block h-screen">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {/* <span className="">LITTO EDU</span> */}
            <Image
              src={littoLogo}
              alt="litto logo"
              width={120}
              height={40}
              className="invert-0 dark:invert"
            />
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
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
              <Mail className="h-4 w-4" />
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
          </nav>
        </div>
        <div className="mt-auto p-4 text-xs text-center text-gray-400">
          &copy; {currentYear} LITTO. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DashboardSideBar;
