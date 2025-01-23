"use client";

import React, { useEffect, useRef, useState } from "react";
import QuizComponentB from "@/components/my-components/QuizComponent-B";
import { useCustomSession } from "@/lib/SessionContext";
import { PartyPopper } from "lucide-react";
import Confetti from "react-confetti";

const Page = () => {
  const { session, updateSession } = useCustomSession();
  const [hasTakenQuizB, setHasTakenQuizB] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (session?.user?.testsTaken) {
      setHasTakenQuizB(session.user.testsTaken.includes("quiz-b"));
      setLoading(false);
    } else if (session?.user?.role === "admin") {
      setLoading(false);
    } else {
      setLoading(true);
    }

    // Initial dimension setup and adding resize listener
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    console.log(dimensions);
    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup resize listener
      window.removeEventListener("resize", handleResize);
    };
  }, [session, setDimensions]);

  // useEffect(() => {
  //   if (session?.user?.testsTaken) {
  //     setHasTakenQuizB(session.user.testsTaken.includes("quiz-b"));
  //     setLoading(false);
  //   } else {
  //     setLoading(true);
  //   }
  // }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden">
      {hasTakenQuizB ? (
        <>
          <div className="flex flex-col items-center -translate-y-1/2">
            <div className="rounded-full bg-orange-500 p-4 mb-4">
              <PartyPopper size={36} className="text-gray-800" />
            </div>
            <p>You have successfully completed this quiz.</p>
            <p>A coupon has been sent to your email.</p>
          </div>
          <Confetti
            width={dimensions.width}
            height={dimensions.height}
            gravity={0.1} // Adjust the gravity for slower speed (default is 0.3)
            recycle={false}
            className="absolute inset-0"
          />
        </>
      ) : (
        <div className="w-full mt-4 -translate-y-1/2">
          <QuizComponentB />
        </div>
      )}
    </div>
  );
};

export default Page;
