// /app/login/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import LoginSwitcher from "@/components/my-components/LoginFormSwitcher";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // Redirect to dashboard if the user is already authenticated
  if (session) {
    redirect("/dashboard");
    return null;
  }

  return <LoginSwitcher />;
}
