import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import QuizClient from "@/components/my-components/QuizClient";

export default async function QuizPage() {
  const session = await getServerSession(authOptions as NextAuthOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <QuizClient session={session} />;
}
