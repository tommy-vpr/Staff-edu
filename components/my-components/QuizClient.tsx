"use client";

import React, { useEffect, useRef, useState } from "react";
import QuizComponent from "@/components/my-components/QuizComponent";
import { PartyPopper } from "lucide-react";
import Confetti from "react-confetti";
import { useCustomSession } from "@/lib/SessionContext";

type Props = {
  session: any;
};

const QuizClient = ({ session }: Props) => {
  const { session: custSession } = useCustomSession();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const parentRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.role === "admin";
  const hasCompletedQuiz = custSession?.user?.testTaken;

  console.log("Test:", session.user.testTaken);

  useEffect(() => {
    if (parentRef.current) {
      setDimensions({
        width: parentRef.current.offsetWidth,
        height: parentRef.current.offsetHeight,
      });
    }
  }, []);

  return (
    <div
      ref={parentRef}
      className="flex justify-center items-center relative h-full"
    >
      {isAdmin ? (
        <div className="text-center">
          <div className="rounded-full bg-green-400 p-4 mb-4 inline-block">
            <PartyPopper size={36} className="text-gray-800" />
          </div>
          <p className="font-medium text-lg">You already know it all!</p>
          <p className="text-sm text-muted-foreground">
            No need for this quiz 😎
          </p>
        </div>
      ) : hasCompletedQuiz ? (
        <>
          <div className="flex flex-col items-center -translate-y-1/2">
            <div className="rounded-full bg-green-400 p-4 mb-4">
              <PartyPopper size={36} className="text-gray-800" />
            </div>
            <p>You have successfully completed this quiz.</p>
            <p>A coupon has been sent to your email.</p>
          </div>
          {dimensions.width > 0 && dimensions.height > 0 && (
            <Confetti
              width={dimensions.width}
              height={dimensions.height}
              gravity={0.1}
              recycle={false}
              className="absolute inset-0"
            />
          )}
        </>
      ) : (
        <div className="w-full h-full flex justify-center items-center">
          <QuizComponent />
        </div>
      )}
    </div>
  );
};

export default QuizClient;
