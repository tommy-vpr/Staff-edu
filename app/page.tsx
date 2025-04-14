// /app/dashboard/page.js
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Image from "next/image";
import heroImage from "@/assets/images/hemp-hero-banner.webp";
import stripes from "@/assets/images/litto-logo-sec.png";
import { redirect } from "next/navigation";
import StaffSignupForm from "@/components/my-components/StaffSignupForm";
import UserSignupForm from "@/components/my-components/UserSignupForm";

export default async function Dashboard() {
  const session = await getServerSession(authOptions as NextAuthOptions);

  if (session?.user) {
    redirect("/dashboard");
    return null;
  }

  return (
    <div className="w-full flex md:h-screen flex-col lg:flex-row">
      <div className="bg-[#101010] w-full lg:w-2/3 relative h-[40vh] md:h-full">
        <Image
          src={stripes}
          width={160}
          quality={100}
          alt="stripes"
          className="absolute top-4 right-4 lg:top-8 lg:right-8 z-10 w-[80px] sm:w-[100px] md:w-[140px] lg:w-[180px]"
        />

        <Image
          src={heroImage}
          alt="Hero Image"
          fill
          priority
          quality={100}
          className="object-cover object-center h-full"
          style={{
            height: "100%", // Ensures full height in mobile view
            width: "100%", // Ensures full width
          }}
        />
      </div>
      <div className="flex items-center justify-center lg:w-1/3 relative">
        <UserSignupForm />
        {/* <StaffSignupForm /> */}
      </div>
    </div>
  );
}
