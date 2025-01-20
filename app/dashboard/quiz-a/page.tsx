"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import QuizComponentA from "@/components/my-components/QuizComponent-A";
import { useCustomSession } from "@/lib/SessionContext";
import { PartyPopper } from "lucide-react";
import Confetti from "react-confetti";

const Page = () => {
  const { session, updateSession } = useCustomSession();
  const [hasTakenQuizA, setHasTakenQuizA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions(); // Set initial dimensions
    window.addEventListener("resize", updateDimensions); // Update on resize

    if (session?.user?.testsTaken) {
      setHasTakenQuizA(session.user.testsTaken.includes("quiz-a"));
      setLoading(false);
    } else if (session?.user?.role === "admin") {
      setLoading(false);
    } else {
      setLoading(true);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-60px)] h-auto flex justify-center items-center relative overflow-hidden">
      {hasTakenQuizA ? (
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-green-400 p-4 mb-4">
            <PartyPopper size={36} className="text-gray-800" />
          </div>
          <p>You have successfully completed this quiz.</p>
          <p>A coupon has been sent to your email.</p>
          <Confetti
            width={dimensions.width} // Use dynamic dimensions
            height={dimensions.height}
            gravity={0.1} // Adjust the gravity for slower speed
            recycle={false}
            className="absolute inset-0"
          />
        </div>
      ) : (
        <div className="w-full mt-4 -translate-y-1/2">
          <QuizComponentA />
        </div>
      )}
    </div>
  );
};

export default Page;
