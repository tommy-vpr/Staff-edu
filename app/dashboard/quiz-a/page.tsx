"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import QuizComponentA from "@/components/my-components/QuizComponent-A";
import { useCustomSession } from "@/lib/SessionContext";
import { PartyPopper } from "lucide-react";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

const Page = () => {
  const { session, updateSession } = useCustomSession();
  const [hasTakenQuizA, setHasTakenQuizA] = useState(false);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null); // Ref to track the outermost div
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (session?.user?.testsTaken) {
      setHasTakenQuizA(session.user.testsTaken.includes("quiz-a"));
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-2/3 flex justify-center items-center relative">
      {hasTakenQuizA ? (
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-green-400 p-4 mb-4">
            <PartyPopper size={36} className="text-gray-800" />
          </div>
          <p>You have successfully completed this quiz.</p>
          <p>A coupon has been sent to you email.</p>
          <Confetti
            width={300}
            height={300}
            gravity={0.1} // Adjust the gravity for slower speed (default is 0.3)
            recycle={false}
            className="m-auto"
          />
        </div>
      ) : (
        <div className="w-full mt-4">
          <QuizComponentA />
        </div>
      )}
    </div>
  );
};

export default Page;
