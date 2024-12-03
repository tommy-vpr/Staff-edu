// /app/dashboard/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Image from "next/image";
import heroImage from "@/assets/images/hero-banner-roof-top.webp";
import stripes from "@/assets/images/litto-logo-sec.png";
import { redirect } from "next/navigation";
import StaffSignupForm from "@/components/my-components/StaffSignupForm";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // Redirect to dashboard if already logged in
  if (session?.user) {
    redirect("/dashboard");
    return null;
  }

  return (
    <div className="w-full flex h-screen flex-col lg:flex-row">
      <div className="bg-[#101010] w-full lg:w-2/3 h-screen overflow-hidden relative">
        <Image
          src={stripes}
          width={60}
          height={200}
          alt="stripes"
          className="absolute top-4 left-4 lg:top-8 lg:left-8 z-10 lg:w-[140px]"
        />
        <Image
          src={heroImage}
          alt="Hero Image"
          fill
          priority
          quality={100}
          className="object-cover object-bottom"
        />
      </div>
      <div className="flex items-center justify-center lg:w-1/3 relative">
        <StaffSignupForm />
      </div>
    </div>
  );
}
