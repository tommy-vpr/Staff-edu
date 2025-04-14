// /app/login/page.js
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import UserLoginForm from "@/components/my-components/UserLoginForm";
import Link from "next/link";
import { HomeIcon } from "lucide-react";
import AdminLoginForm from "@/components/my-components/AdminLoginForm";

export default async function Page() {
  const session = await getServerSession(authOptions as NextAuthOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex justify-center items-center w-full h-screen flex-col">
      <div className="w-[400px]">
        <AdminLoginForm />
      </div>
      <div className="text-center flex justify-center mt-4 gap-4">
        <Link
          href="/"
          className="text-gray-400 hover:text-white transition duration-200 flex items-center gap-2"
        >
          <HomeIcon size={16} /> Home
        </Link>
      </div>
    </div>
  );
}
