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

  useEffect(() => {
    if (session?.user?.testsTaken) {
      setHasTakenQuizB(session.user.testsTaken.includes("quiz-b"));
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
      {hasTakenQuizB ? (
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-orange-500 p-4 mb-4">
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
          <QuizComponentB />
        </div>
      )}
    </div>
  );
};

export default Page;
