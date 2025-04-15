// /app/login/page.js
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import UserLoginForm from "@/components/my-components/UserLoginForm";
import Link from "next/link";
import { HomeIcon } from "lucide-react";

export default async function Page() {
  const session = await getServerSession(authOptions as NextAuthOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex justify-center items-center w-full h-screen flex-col">
      <div className="w-[400px]">
        <UserLoginForm />
      </div>
      <div className="text-center flex justify-center mt-4 gap-4">
        <div className="text-center flex justify-center mt-4 gap-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-500 dark:hover:text-white transition duration-200 flex items-center gap-2"
          >
            <HomeIcon size={16} /> Home
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/admin-login"
            className="text-gray-400 hover:text-gray-500 dark:hover:text-white transition duration-200"
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
